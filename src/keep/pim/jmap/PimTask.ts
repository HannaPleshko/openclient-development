import { KeepPimConstants, PimItemFormat, PimTaskPriority, PimTaskProgress } from '../KeepPimConstants';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../utils/logger';
import { PimCommonEventsJmap } from '../../../internal';
import { DateTime } from 'luxon';

/**
 * Represents a task returned fro the Keep PIM task api. 
 */
export class PimTask extends PimCommonEventsJmap {

    constructor(jmapObject: any, format?: PimItemFormat, viewname?: string) {
        super(jmapObject, format, viewname);
        if (!this.jmapObject['@type']) {
            this.jmapObject['@type'] = this.type;
        }
    }

    /**
     * Return true if this object implements the PimTask interface
     * @return True if the item implements the PimTask protocol
     */
    isPimTask(): this is PimTask {
        return true;
    }

    /**
     * Returns the person that created this task. 
     */
    get from(): string | undefined {
        const owners = this.getParticipantsWithRole(KeepPimConstants.ROLE_OWNER);
        return owners?.length > 0 ? owners[0].email : undefined;
    }

    set from(person: string | undefined) {
        // First check that there isn't an existing owner
        const from = this.from;
        if (from) {
            if (from !== person) {
                // Change owner to be the new person
                // Do we remove the previous owner or change the previous owner to a participant.  
                // We're choosing to remove the previous owner
                this.removeParticipants(from);
            } else {
                // We're done...the same person is already the owner
                return;
            }
        }
        if (person) {
            // Add the new from
            if (!this.jmapObject.participants) {
                this.jmapObject.participants = {};
            }
            this.jmapObject.participants[uuidv4()] = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: person,
                roles: {
                    "owner": true
                }
            };
        }
    }

    /**
     * Returns the altChair of the task
     */
    get altChair(): string | undefined {
        const chairs = this.getParticipantsWithRole(KeepPimConstants.ROLE_CHAIR);
        return chairs?.length > 0 ? chairs[0].email : undefined;
    }

    /**
     * Sets the altChair for the task
    */
    set altChair(alt: string | undefined) {
        // First check that there isn't an existing owner
        const chair = this.altChair;
        if (chair) {
            if (chair !== alt) {
                // Change chair to be the new person
                // Do we remove the previous chair or change the previous chair to a participant.  
                // We're choosing to remove the previous chair
                this.removeParticipants(chair);
            } else {
                // We're done...the same person is already the owner
                return;
            }
        }
        if (alt) {
            // Add the new participant
            if (!this.jmapObject.participants) {
                this.jmapObject.participants = {};
            }
            this.jmapObject.participants[uuidv4()] = {
                type: KeepPimConstants.TYPE_PARTICIPANT,
                email: alt,
                roles: {
                    "chair": true
                }
            };
        }
    }

    /**
     * Returns the due date for the task.
     * 
     * If this is a recurring task, this is the due date of the first occurence. 
     */
    get due(): string | undefined {
        if (this.jmapObject.due) {
            const dt = DateTime.fromISO(this.jmapObject.due, {setZone: true});

            // Don't include the timezone if it is local. This means no startTimeZone set. 
            return dt.toISO({ includeOffset: dt.zone.type === 'local' ? false : true });
        }

        return undefined;
    }

    /**
     * Set the task due date.
     * 
     * If this is a recurring task, this is the due date of the first occurence. 
     */
    set due(date: string | undefined) {
        if (date) {
            const dt = DateTime.fromISO(date, {setZone: true});
            this.jmapObject.due = dt.toISO({ includeOffset: dt.zone.type === 'local' ? false : true });
        }
        else {
            this.jmapObject.due = date;
        }
    }

    /**
     * Returns the type of jmap object
     */
    get type(): string {
        return this.jmapObject['@type'] ?? "jstask";
    }

    /**
     * Returns the TaskType of the string
     */
    get taskType(): string | undefined {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_TASK_TYPE) ?? undefined;  // Don't return null
    }

    /**
     * Sets the TaskType of the string
     */
    set taskType(type: string | undefined) {
        if (type) {
            this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_TASK_TYPE, type);
        } else {
            this.deleteAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_TASK_TYPE);
        }
    }

    /**
     * If the task is completed, returns the date the task was complete. Otherwise returns undefined.
     */
    get completedDate(): Date | undefined {
        // const cDate = this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_COMPLETED_DATE) ?? undefined;  // Don't return null
        const cDate = this.jmapObject.completed;
        if (cDate) {
            if (typeof (cDate) === 'string') {
                return new Date(cDate);
            }
        } else if (this.isComplete) {
            this.completedDate = new Date();
        }
        return undefined;
    }

    set completedDate(completed: Date | undefined) {
        if (completed) {
            //     this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_COMPLETED_DATE, getTrimmedISODate(completed));
            // } else {
            //     this.deleteAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_COMPLETED_DATE);
            this.jmapObject.completed = completed.toISOString();
        } else {
            this.jmapObject.completed = undefined;
        }
        const isComp = this.isComplete;
        if ((completed && !isComp) || (!completed && isComp)) {
            this.isComplete = completed !== undefined;
        }
    }

    /**
     * Returns the priority of the task. 
     */
    get priority(): PimTaskPriority {
        const priority = this.jmapObject.priority;
        if (priority !== undefined && (typeof (priority) === 'number')) {
            switch (true) {
                case (priority === 0):
                    return PimTaskPriority.NONE;
                case (priority <= 3):
                    return PimTaskPriority.HIGH;
                case (priority <= 6):
                    return PimTaskPriority.MEDIUM;
                case (priority <= 9):
                    return PimTaskPriority.LOW;
                default:
                    Logger.getInstance().warn(`Unexpected item priority ${priority}`);
            }
        }
        return PimTaskPriority.NONE;
    }

    /**
     * Sets the priority of the task. 
     */
    set priority(priority: PimTaskPriority) {
        switch (priority) {
            case PimTaskPriority.LOW:
                this.jmapObject.priority = 9;
                break;
            case PimTaskPriority.MEDIUM:
                this.jmapObject.priority = 5;
                break;
            case PimTaskPriority.HIGH:
                this.jmapObject.priority = 1;
                break;
            default:
                // PimTaskPriority.NONE
                this.jmapObject.priority = 0;
        }
    }

    /**
     * Returns a label descrbing the status. 
     */
    get statusLabel(): string | undefined {
        return this.getAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_STATUS_LABEL) ?? undefined;  // Don't return null
    }

    set statusLabel(label: string | undefined) {
        if (label) {
            this.setAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_STATUS_LABEL, label);
        } else {
            this.deleteAdditionalProperty(KeepPimConstants.EXT_ADDITIONAL_STATUS_LABEL);
        }
    }

    get progress(): PimTaskProgress | undefined {
        return this.jmapObject.progress;
    }

    set progress(progress: PimTaskProgress | undefined) {
        this.jmapObject.progress = progress;
        if (progress === PimTaskProgress.COMPLETED) {
            if (!this.completedDate) {
                this.completedDate = new Date();
            }
        } else {
            this.completedDate = undefined;
        }

    }

    /**
     * Returns true if the task is in progress.
     */
    get isInProgress(): boolean {
        if (this.progress === undefined) {
            return this.getParticipantProgress() === PimTaskProgress.IN_PROCESS;
        } else {
            return this.progress === PimTaskProgress.IN_PROCESS;
        }
    }

    set isInProgress(status: boolean) {
        if (status) {
            this.progress = PimTaskProgress.IN_PROCESS;
        } else {
            this.progress = (this.getParticipantProgress() === PimTaskProgress.IN_PROCESS) ? PimTaskProgress.NEEDS_ACTION : undefined;
        }
    }

    /**
     * Returns true if the task is over due.
     */
    get isOverDue(): boolean {
        if (this.isComplete) {
            return false;
        }

        if (this.due === undefined) {
            return false;
        }
        const dDate = new Date(this.due);

        const cDate = this.completedDate;
        if (cDate !== undefined) {
            // It's complete
            return false;
        }
        const currentDate = new Date();

        if (currentDate < dDate) {
            return false;  // Still a later due date
        }

        return true;
    }

    set isOverDue(status: boolean) {
        this.isComplete = !status;
    }

    /**
     * Returns true if the task is in completed.
     */
    get isComplete(): boolean {
        if (this.progress === undefined) {
            return this.getParticipantProgress() === PimTaskProgress.COMPLETED;
        } else {
            return this.progress === PimTaskProgress.COMPLETED;
        }
    }

    set isComplete(status: boolean) {
        if (status) {
            this.progress = PimTaskProgress.COMPLETED;
        } else {
            this.progress = (this.getParticipantProgress() === PimTaskProgress.COMPLETED) ? PimTaskProgress.NEEDS_ACTION : undefined;
        }
    }

    /**
     * Returns true if the task is in not started.
     */
    get isNotStarted(): boolean {
        if (this.progress === undefined) {
            return this.getParticipantProgress() === PimTaskProgress.NEEDS_ACTION;
        } else {
            return this.progress === PimTaskProgress.NEEDS_ACTION;
        }
    }

    set isNotStarted(status: boolean) {
        if (status) {
            this.progress = PimTaskProgress.NEEDS_ACTION;
        } else {
            this.progress = (this.getParticipantProgress() === PimTaskProgress.NEEDS_ACTION) ? PimTaskProgress.IN_PROCESS : undefined;
        }
    }

    /**
     * Returns true if the task is failed.
     */
    get isRejected(): boolean {
        if (this.progress === undefined) {
            return this.getParticipantProgress() === PimTaskProgress.FAILED;
        } else {
            return this.progress === PimTaskProgress.FAILED;
        }
    }

    set isRejected(status: boolean) {
        if (status) {
            this.progress = PimTaskProgress.FAILED;
        } else {
            this.progress = (this.getParticipantProgress() === PimTaskProgress.FAILED) ? PimTaskProgress.NEEDS_ACTION : undefined;
        }
    }


    getParticipantProgress(): PimTaskProgress {
        let completed = true;
        let failed = false;
        let inProcess = false;
        const taskParticipants = this.getParticipants();
        if (taskParticipants.length > 0) {
            for (const participant of taskParticipants) {
                switch (participant.progress) {
                    case PimTaskProgress.COMPLETED:
                        // Do nothing...already true or flipped by another participant progress
                        break;
                    case PimTaskProgress.FAILED:
                        completed = false;
                        failed = true;
                        break;
                    case PimTaskProgress.IN_PROCESS:
                        completed = false;
                        inProcess = true;
                        break;
                    case PimTaskProgress.NEEDS_ACTION:
                    default:
                        completed = false;
                }
            }
            if (completed) {
                return PimTaskProgress.COMPLETED;
            } else if (failed) {
                return PimTaskProgress.FAILED;
            } else if (inProcess) {
                return PimTaskProgress.IN_PROCESS
            }
        }
        return PimTaskProgress.NEEDS_ACTION;
    }

    /**
     * Returns a structure that can be used to create or update a PIM item on the Keep API. 
     * @returns An object to use when creating or updating a PIM item. 
     */
    public toPimStructure(): object {
        if (this.start) {
            this.start = (new Date()).toISOString();
        }
        return super.toPimStructure();
    }

}