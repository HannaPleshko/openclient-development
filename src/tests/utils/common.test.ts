import { expect } from "@loopback/testlab";
import sinon from "sinon";
import { OpenClientKeepComponent } from "../../OpenClientKeepComponent";
import { 
    base64Decode, base64Encode, convertToListObject, getDates, getKeepUrl, hasHTML, isEmail, nameFromTimeZone, 
    parseValue, yesterday, getIANATimeZone
} from "../../utils/common";

describe('common.ts file', function() {
    it('base64Encode', function() {
        const buffer = {
            str: 'How are you',
            data: 'SG93IGFyZSB5b3U='
        };
        expect(base64Encode(buffer.str).toString()).to.be.equal(buffer.data);
    });
    
    it('base64Decode', function() {
        const buffer = {
            str: 'How are you',
            data: 'SG93IGFyZSB5b3U='
        };
       expect(base64Decode(buffer.data)).to.be.equal(buffer.str).toString();
    });
    
    it('hasHTML', function() {
        const data1 = '<p>Welcome to base64 encode/decode</p>';
        expect(hasHTML(data1)).to.be.equal(true);

        const data2 = 'Welcome to base64 encode/decode';
        expect(hasHTML(data2)).to.be.equal(false);
    });

    it('getKeepURL', function() {
        const toConvert1 = 'https://www.xyz.com';
        expect(getKeepUrl(toConvert1)).to.be.equal('https://www.xyz.com');

        sinon.stub(OpenClientKeepComponent, 'getKeepBaseUrl').callsFake(() => {
            return 'https://www.abc.com';
        });
        
        const toConvert2 = '/welcome/';
        expect(getKeepUrl(toConvert2)).to.be.equal('https://www.abc.com/welcome/');

        const toConvert3 = 'welcome/';
        expect(getKeepUrl(toConvert3)).to.be.equal('https://www.abc.com/welcome/');

        sinon.restore();
    });

    it('isEmail', function() {
        const email1 = 'test1@xyz.com';
        expect(isEmail(email1)).to.be.equal(true);

        const email2 = 'test2xyz.com';
        expect(isEmail(email2)).to.be.equal(false);
    });

    it('nameFromTimeZone', function() {
        const timezone1 = 'Z=5$DO=1$DL=3 2 1 11 1 1$ZX=148$ZN=America/New_York';
        expect(nameFromTimeZone(timezone1)).to.be.equal('America/New_York');

        const timezone2 = '';
        expect(nameFromTimeZone(timezone2)).to.be.equal(undefined);
    });

    it('parseValue', function(){
        const parseval = "test";
        const obj = {test:"testval"}
        expect(parseValue(parseval , obj)).to.deepEqual("testval");

        const parseval2 = "test2";
        const obj2 = {test2:""}
        expect(parseValue(parseval2 , obj2)).to.be.undefined();

    });
    it('convertToListObject', function(){
        const data = [ "item1", "item2", "item3" ];
        expect(convertToListObject(data)).to.deepEqual(data);
       
        const data2 = "[ a, b, c";
        expect(convertToListObject(data2)).to.deepEqual([data2]);

        const data3 = "a, b, c ]";
        expect(convertToListObject(data3)).to.deepEqual([data3]);

        const data4 = "[a, b, c]";
        const abcResult = [ "a", "b", "c" ];
        expect(convertToListObject(data4)).to.deepEqual(abcResult);

        const data5 = "[ a, b, c]";
        expect(convertToListObject(data5)).to.deepEqual(abcResult);

        const data6 = "a b c";
        expect(convertToListObject(data6)).to.deepEqual([data6]);

        const data7 =  {} ;
        expect(convertToListObject(data7)).to.deepEqual([]);
        
    });

    it('yesterday', function(){
       
      const date = new Date(new Date().setDate(new Date().getDate()-1))
      expect(yesterday()).to.deepEqual(date);

    });

    it('getDates', function(){

        const datetime = ["06/30/2020 12:01:00 PM" , "07/07/2020 12:01:00 PM" ,"07/14/2020 12:01:00 PM","07/21/2020 12:01:00 PM"];
        const dates = getDates(datetime);
        expect(dates).to.be.an.Array();
        expect(dates[0]).to.eql(new Date("06/30/2020 12:01:00 PM"));
        expect(dates).to.be.length(4);

        const datetime2 = ["06/30/2020 12:01:00 PM" ,"test1"];
        const dates2 = getDates(datetime2);

        expect(dates2).to.be.an.Array();
        expect(dates2[0]).to.eql(new Date("06/30/2020 12:01:00 PM"));
        expect(dates2).to.be.length(1);
       
        const datetime3 = "test1";
        expect(getDates(datetime3)).to.deepEqual([]);
      
    });

    it('test getIANATimeZone', () => {
        let result = getIANATimeZone('America/New_York');
        expect(result).to.be.equal('America/New_York');

        result = getIANATimeZone('UTC');
        expect(result).to.be.equal('Etc/UTC');

        result = getIANATimeZone('UTC+5');
        expect(result).to.be.equal('Etc/GMT-5');

        result = getIANATimeZone('UTC-8');
        expect(result).to.be.equal('Etc/GMT+8');

        expect(() => { getIANATimeZone('Bad/TimeZone') }).to.throw();

    });

});
