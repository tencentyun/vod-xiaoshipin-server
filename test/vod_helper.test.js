


const assert = require('assert');
const VodHelper = require('../utils/vod_helper').VodHelper;
let vodHelper = null;

let extraOpt = { };
before(async function () {
    //配置文件加载
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('./conf/localconfig.json'));
    vodHelper = new VodHelper(config.tencentyunaccout);
});

describe('VodHelper test', function () {
    this.timeout(10000);
    it('getVideoInfo', async function () {
        let data = await vodHelper.getVideoInfo({
            fileId:"7447398155217586128",
            extraOpt
        });
        assert.notEqual(data.code,undefined);
    });

    it('getVideoInfo With filter', async function () {
        let data = await vodHelper.getVideoInfo({
            fileId:"7447398155217586128",infoFilter:['transcodeInfo'],extraOpt
        });
        assert.equal(data.basicInfo,undefined);
    });

    it('createFileUploadSignature', async function () {
        let data = await vodHelper.createFileUploadSignature({procedure:'QCVB_SimpleProcessFile(1)'});
        assert.notEqual(data,undefined);
    });

});




after(function () {



});