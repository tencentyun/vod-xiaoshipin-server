
const Bluebird = require("bluebird");
Bluebird.promisifyAll(require('mysql'));
Bluebird.promisifyAll(require("mysql/lib/Connection").prototype);
Bluebird.promisifyAll(require("mysql/lib/Pool").prototype);

var mysql = require('mysql');

class MySQLHelper {

    constructor(conf){
        this.pool = mysql.createPool(conf);
    }

    getConnection(){
        return this.pool.getConnectionAsync();
    }

    makeUpdateSql(tbl, obj, whereClause){
        var col = [],
            val = [];

        for (var key in obj) {
            col.push(key);
            val.push(obj[key]);
        }
        var sql = 'update ' + tbl + ' set ';
        for (var i = 0; i < col.length; i++) {

            sql += i == 0 ? '' : ',';

            sql += col[i];
            sql += '=?';
        }
        sql += ' ' + whereClause;
        return mysql.format(sql, val);
    }
}

module.exports = MySQLHelper;
