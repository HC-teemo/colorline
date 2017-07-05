var mongodb = require('./db');

function cloth(cloth) {
  this.name=cloth.name;
  this.category=cloth.category;
  this.price=cloth.price;
};

module.exports = cloth;

//存储信息
cloth.prototype.save = function(callback) {
  var cloth = {
    name:this.name,
    category:this.category,
    price:this.price,
    size:[],
    pryPic:null,
    othPic:[]
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 cloth 集合
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 cloth 集合
      collection.insert(cloth, {
        safe: true
      }, function(err, cloth) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, cloth.ops[0]); //成功！err 为 null，并返回存储后的文档
      });
    });
  });
};

cloth.getAll = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({
      }).toArray(function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news);
      });
    });
  });
};

cloth.getByCty = function(type, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({
        category: type,
      }).toArray(function(err, cloth) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, cloth);
      });
    });
  });
};


cloth.accurate = function(id, callback) {
  //打开数据库
  var BSON = require('bson');
	var obj_id = BSON.ObjectID.createFromHexString(id);//哈希字符串
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.findOne({
        _id: obj_id
      }, function(error, cloth) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, cloth);
      });
    });

  });
};

cloth.addPic = function(info, callback) {
  //打开数据库
  console.log(info.type=='pry');
  var BSON = require('bson');
	var obj_id = BSON.ObjectID.createFromHexString(info.id);//哈希字符串
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      if(info.type=='pry'){
        collection.update({
            _id: obj_id
          }, {
            $set: {
              pryPic: info.img
            }
          }, function(err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
            callback(null);
          });
      }else{
        collection.update({
            _id: obj_id
          }, {
            $addToSet: {
              othPic: info.img
            }
          }, function(err) {
            mongodb.close();
            if (err) {
              return callback(err);
            }
            callback(null);
          });
      }
    });

  });
};

cloth.addSize = function(info, callback) {
  //打开数据库
  var BSON = require('bson');
	var obj_id = BSON.ObjectID.createFromHexString(info.id);//哈希字符串
  var size={
    size:info.size,
    img:info.img
  }
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('cloth', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.update({
        _id: obj_id
      }, {
        $addToSet: {
          size: size
        }
      }, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });

  });
};
