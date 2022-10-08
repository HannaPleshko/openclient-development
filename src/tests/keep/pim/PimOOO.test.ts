/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {expect} from '@loopback/testlab';
import {PimOOO, OOOExternalAudience, OOOState } from '../../../keep';

describe('PimOOO tests', () => {
        describe('Test getter and setter', () => {
            it('externalAudience', () => {       
                const pimObject: any = {
                    "ExcludeInternet" : true
                }
                const pimOOO = new PimOOO(pimObject);
               expect(pimOOO.externalAudience).to.be.equal(OOOExternalAudience.NONE);

                pimOOO.externalAudience = OOOExternalAudience.KNOWN;
                expect(pimOOO.externalAudience).to.be.equal(OOOExternalAudience.KNOWN);

                pimOOO.externalAudience = OOOExternalAudience.ALL;
                expect(pimOOO.externalAudience).to.be.equal(OOOExternalAudience.ALL);

            });

            it('state', () => {
                const pimObject: any ={
                    "Enabled": true
                }

                const pimOOO = new PimOOO(pimObject);
                expect(pimOOO.state).to.be.equal(OOOState.ENABLED);

                pimOOO.state = OOOState.DISABLED;
                expect(pimOOO.state).to.be.equal(OOOState.DISABLED);

                pimOOO.state = OOOState.SCHEDULED;
                expect(pimOOO.state).to.be.equal(OOOState.SCHEDULED); 

            });

            it('startDate', () => {
                const pimObject: any = {
                    "StartDateTime": "1990-12-25T11:00:00.000Z"
                }
                const pimOOO = new PimOOO(pimObject);
                expect(pimOOO.startDate!.getTime() - new Date("1990-12-25T11:00:00.000Z").getTime()).to.be.equal(0);

                pimOOO.startDate = new Date("1990-12-25T11:00:00.000Z");
                expect(pimOOO.startDate!.getTime() - new Date("1990-12-25T11:00:00.000Z").getTime()).to.be.equal(0);
    
                pimOOO.startDate = undefined;
                expect(pimOOO.startDate).to.be.undefined();
            });

            it('endDate', () => {
                const pimObject: any = {
                    "EndDateTime": "1991-11-25T11:00:00.000Z"
                }
                const pimOOO = new PimOOO(pimObject);
                expect(pimOOO.endDate!.getTime() - new Date("1991-11-25T11:00:00.000Z").getTime()).to.be.equal(0);

                pimOOO.endDate = new Date("1990-12-25T11:00:00.000Z");
                expect(pimOOO.endDate!.getTime() - new Date("1990-12-25T11:00:00.000Z").getTime()).to.be.equal(0);
    
                pimOOO.endDate = undefined;
                expect(pimOOO.endDate).to.be.undefined();
            });

            it('replyMessage', () => {
                const pimObject: any = {
                    "ExternalReply": 'Message from user'
                }

                let pimOOO = new PimOOO(pimObject);
                expect(pimOOO.replyMessage).to.be.equal('Message from user');
              
                pimOOO.replyMessage = "updated message";
                expect(pimOOO.replyMessage).to.be.equal('updated message')

                pimOOO = new PimOOO({});
                expect(pimOOO.replyMessage).to.be.equal("")

                pimOOO.replyMessage = "";
                expect(pimOOO.replyMessage).to.be.equal("");
            })

        })
})

