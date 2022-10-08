/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from "@loopback/testlab";
import { PimRecurrenceDayOfWeek, PimRecurrenceFrequency, PimRecurrenceRule, PimRecurrenceSkip } from "../../../../keep/pim/jmap/PimRecurrenceRule";

describe('PimRecurrenceRule tests', () => {
    describe('getters and setters', () => {

        it('frequency', () => {
            const jmap = {
                "@type": "RecurrenceRule",
                "frequency": "daily"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.frequency).to.be.equal(PimRecurrenceFrequency.DAILY);

            rule.frequency = PimRecurrenceFrequency.MONTHLY;
            expect(rule.frequency).to.be.equal(PimRecurrenceFrequency.MONTHLY);

        });

        it('interval', () => {
            const jmap = {
                "@type": "RecurrenceRule",
                "interval": 1
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.interval).to.be.equal(1);

            rule.interval = 20;
            expect(rule.interval).to.be.equal(20);

            rule.interval = 0;
            expect(rule.interval).to.be.equal(1); // Minimum is 1.
        });

        it('rscale', () => {
            const jmap = {
                "@type": "RecurrenceRule",
                "rscale": "gregorian"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.rscale).to.be.equal("gregorian");

            rule.rscale = "chinese";
            expect(rule.rscale).to.be.equal("chinese");

        });

        it('skip', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.skip).to.be.equal(PimRecurrenceSkip.OMIT); // Default value

            rule.skip = PimRecurrenceSkip.FORWARD;
            expect(rule.skip).to.be.equal(PimRecurrenceSkip.FORWARD);
        });

        it('firstDayOfWeek', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.firstDayOfWeek).to.be.equal(PimRecurrenceDayOfWeek.MONDAY); // Default value

            rule.firstDayOfWeek = PimRecurrenceDayOfWeek.SATURDAY;
            expect(rule.firstDayOfWeek).to.be.equal(PimRecurrenceDayOfWeek.SATURDAY);
        });

        it('byDay', () => {
            const jmap: any = {
                "@type": "RecurrenceRule"
            };

            let rule = new PimRecurrenceRule(jmap);
            expect(rule.byDay).to.be.undefined();

            jmap.byDay = [
                { "@type": "NDay", day: "tu", nthOfPeriod: 3 },
                { "@type": "NDay", day: "fr" }
            ];
            rule = new PimRecurrenceRule(jmap);
            expect(rule.byDay?.length).to.be.equal(2);
            expect(rule.byDay![0].day).to.be.equal(PimRecurrenceDayOfWeek.TUESDAY);
            expect(rule.byDay![0].nthOfPeriod).to.be.equal(3);

            expect(rule.byDay![1].day).to.be.equal(PimRecurrenceDayOfWeek.FRIDAY);
            expect(rule.byDay![1].nthOfPeriod).to.be.undefined();

            rule.byDay = [{ day: PimRecurrenceDayOfWeek.WEDNESDAY, nthOfPeriod: 2 }];
            expect(rule.byDay.length).to.be.equal(1);
            expect(rule.byDay[0].day).to.be.equal(PimRecurrenceDayOfWeek.WEDNESDAY);
            expect(rule.byDay[0].nthOfPeriod).to.be.equal(2);

            const json: any = rule.toPimStructure();
            expect(json.byDay[0]["@type"]).to.be.equal("NDay");

        });

        it('byMonthDay', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byMonthDay).to.be.undefined();

            rule.byMonthDay = [10, 20];
            expect(rule.byMonthDay).to.be.deepEqual([10, 20]);

            rule.byMonthDay = [];
            expect(rule.byMonthDay).to.be.undefined();

            rule.byMonthDay = undefined;
            expect(rule.byMonthDay).to.be.undefined();
        });

        it('byMonth', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byMonth).to.be.undefined();

            rule.byMonth = ["1", "4"];
            expect(rule.byMonth).to.be.deepEqual(["1", "4"]);

            rule.byMonth = [];
            expect(rule.byMonth).to.be.undefined();

            rule.byMonth = undefined;
            expect(rule.byMonth).to.be.undefined();
        });

        it('byYearDay', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byYearDay).to.be.undefined();

            rule.byYearDay = [50, 170];
            expect(rule.byYearDay).to.be.deepEqual([50, 170]);

            rule.byYearDay = [];
            expect(rule.byYearDay).to.be.undefined();

            rule.byYearDay = undefined;
            expect(rule.byYearDay).to.be.undefined();
        });

        it('byWeekNo', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byWeekNo).to.be.undefined();

            rule.byWeekNo = [2, 43];
            expect(rule.byWeekNo).to.be.deepEqual([2, 43]);

            rule.byWeekNo = [];
            expect(rule.byWeekNo).to.be.undefined();

            rule.byWeekNo = undefined;
            expect(rule.byWeekNo).to.be.undefined();
        });

        it('byHour', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byHour).to.be.undefined();

            rule.byHour = [2, 15];
            expect(rule.byHour).to.be.deepEqual([2, 15]);

            rule.byHour = [];
            expect(rule.byHour).to.be.undefined();

            rule.byHour = undefined;
            expect(rule.byHour).to.be.undefined();
        });

        it('byMinute', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.byMinute).to.be.undefined();

            rule.byMinute = [2, 43];
            expect(rule.byMinute).to.be.deepEqual([2, 43]);

            rule.byMinute = [];
            expect(rule.byMinute).to.be.undefined();

            rule.byMinute = undefined;
            expect(rule.byMinute).to.be.undefined();
        });

        it('bySecond', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.bySecond).to.be.undefined();

            rule.bySecond = [2, 43];
            expect(rule.bySecond).to.be.deepEqual([2, 43]);

            rule.bySecond = [];
            expect(rule.bySecond).to.be.undefined();

            rule.bySecond = undefined;
            expect(rule.bySecond).to.be.undefined();
        });

        it('bySetPosition', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.bySetPosition).to.be.undefined();

            rule.bySetPosition = [-5, 3];
            expect(rule.bySetPosition).to.be.deepEqual([-5, 3]);

            rule.bySetPosition = [];
            expect(rule.bySetPosition).to.be.undefined();

            rule.bySetPosition = undefined;
            expect(rule.bySetPosition).to.be.undefined();
        });

        it('count', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.count).to.be.undefined();

            rule.count = 3;
            expect(rule.count).to.be.equal(3);

            rule.count = undefined;
            expect(rule.count).to.be.undefined();

            // count and until are mutually exclusize
            rule.count = 2;
            rule.until = "2021-01-25T15:00:00.000Z";
            expect(rule.count).to.be.undefined();


        });

        it('until', () => {
            const jmap = {
                "@type": "RecurrenceRule"
            };

            const rule = new PimRecurrenceRule(jmap);
            expect(rule.until).to.be.undefined();

            rule.until = "2021-01-25T15:00:00.000Z";
            expect(rule.until).to.be.equal("2021-01-25T15:00:00.000Z");

            rule.until = undefined;
            expect(rule.until).to.be.undefined();

            // until and count are mutually exclusize
            rule.until = "2021-01-25T15:00:00.000Z";
            rule.count = 2;
            expect(rule.until).to.be.undefined();

        });
    });

    it('constructor and toPimStructure', () => {

        let rule = new PimRecurrenceRule({});
        let struct: any = rule.toPimStructure();
        expect(struct["@type"]).to.be.equal("RecurrenceRule");

        let jmap: any = {
            "@type": "RecurrenceRule"
        };
        rule = new PimRecurrenceRule(jmap);
        struct = rule.toPimStructure();
        expect(struct["@type"]).to.be.equal("RecurrenceRule");

        jmap = {
            "@type": "RecurrenceRule",
            "frequency": "weekly",
            "until": "2020-06-24T09:00:00"
        };
        rule = new PimRecurrenceRule(jmap);
        struct = rule.toPimStructure();
        expect(struct).to.deepEqual(jmap);

    });
});