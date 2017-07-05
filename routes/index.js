var express = require('express');
var router = express.Router();
var multipart = require("connect-multiparty"); //并行上传
var async = require("async"); //控制流
var upload = require("./upload"); //上传
var request = require('request');

var cloth = require("../models/cloth"); //款式
var category = require("../models/category"); //类型
// var comments = require("../models/comments"); //评论

/* GET page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  console.log(req);
});

router.get('/main', function(req, res, next) {
  var code=req.query.code;
  var appId="wx4e857afc248cad8e";
  var appsecret="ffcbdbde8b43d44b447a0bfa94933f37";
  reqUrl="https://api.weixin.qq.com/sns/oauth2/access_token?appid="+appId+"&secret="+appsecret+"&code="+code+"&grant_type=authorization_code";
  request({url:reqUrl}, function(err, response, body){
    var resd = eval('(' + body + ')');
    var infoUrl="https://api.weixin.qq.com/sns/userinfo?access_token="+resd.access_token+"&openid="+resd.openid+"&lang=zh_CN";
    console.log(infoUrl);
    request({url:infoUrl}, function(err, response, body){
      var info = eval('(' + body + ')');
      req.session.user=info;
      res.render('main',{"data":info});
    });
  });
});

router.get('/category', function(req, res, next) {
  category.getAll(function(e,c){
    if (e) {
      var msg = {
        state: false,
        info: e
      };
      return res.send(msg);
    } else {
      res.render("category", {
        categorys: c
      });
    }
  });
});

router.get('/style/:name', function(req, res, next) {
  var name = req.params.name;
  console.log(name);
  cloth.getByCty(name,function(e,c){
    if (e) {
      var msg = {
        state: false,
        info: e
      };
      return res.send(msg);
    } else {
      res.render("style", {
        cloths: c
      });
    }
  });
});

router.get('/choose/:id', function(req, res, next) {
  var id = req.params.id;
  console.log(id);
  cloth.accurate(id,function(e,c){
    if (e) {
      var msg = {
        state: false,
        info: e
      };
      return res.send(msg);
    } else {
      res.render("choose", {
        cloth: c
      });
    }
  });
});

router.get('/upload', function(req,res,next){
  var user=req.session.user;
  async.waterfall([
    function(cb) {
      category.getAll(function(e, n) {
        if (e) {
          cb("请重试", null);
        } else {
          cb(null, n);
        }
      });
    },
    function(n, cb) {
      cloth.getAll(function(e, u) {
        if (e) {
          cb("请重试", null);
        } else {
          cb(null, n, u);
        }
      });
    }
  ], function(e, n, u) {
    if (e) {
      var msg = {
        state: false,
        info: e
      };
      return res.send(msg);
    } else {
      res.render("upload", {
        data:{
          user: user,
          category: n,
          cloth: u
        }
      });
    }
  });
});

router.get('/admin-sign', function(req, res, next) {
  res.render('admin-sign', { title: 'Express' });
});

router.get('/admin', function(req, res, next) {
  //TODO admin,order
  // var us = req.session.user;
  // if (!us) {
  //   res.redirect('/'); //没登录，回主页
  // } else if (us.quanxian != 1) {
  //   res.redirect('/'); //权限不为1，回主页
  // } else {
    async.waterfall([
      function(cb) {
        category.getAll(function(e, n) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, n);
          }
        });
      },
      function(n, cb) {
        cloth.getAll(function(e, u) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, n, u);
          }
        });
      // },
      // function(n, u, cb) {
      //   comments.allComments(function(e, c) {
      //     if (e) {
      //       cb("请重试", null);
      //     } else {
      //       cb(null, n, u, c);
      //     }
      //   });
      }
    ], function(e, n, u) {
      if (e) {
        var msg = {
          state: false,
          info: e
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        res.render("admin", {
          // user: us,
          category: n,
          cloth: u
          // comments: c,
        });
      }
    });
  // }
});

router.get('/clothinfo/:id', function(req, res, next) {
  var id = req.params.id;
  console.log("clothinfo:"+id);
  cloth.accurate(id,function(e,c){
    if (e) {
      var msg = {
        state: false,
        info: e
      };
      return res.send(msg);
    } else {
      res.render("clothinfo", {
        cloth: c
      });
    }
  });
});


/*POST function*/

router.post('/login', function(req, res, next) {
  console.log(req);
});

router.post('/admin-signin', function(req,res){
  //TODO admin-signin
});


router.post('/addCategory', multipart(), function(req,res){
  async.waterfall([
      function(cb) {
        category.accurate(req.body.name, function(e, ca) {
          if (ca) {
            cb("已存在");
          } else if (e) {
            cb("请重试");
          } else {
            cb(null);
          }
        })
      },
      function(cb) {
        upload.upload(req, function(e,name) {
          if (e) {
            cb(e,null)
          } else {
            cb(null,name)
          }
        });
      },
      function(name,cb) {
        console.log("new file :"+name);
        var new_category = new category({
          name: req.body.name,
          img: name
        });
        //如果不存在则新增用户
        new_category.save(function(e, category) {
          if (e) {
            cb("请重试");
          }
          cb(null); //成功后返回
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
        }; //注册失败返回主册页
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });
});

router.post('/addCloth', function(req,res){
  console.log(req.body);
  async.waterfall([
    function(cb) {
        var new_cloth = new cloth({
          name: req.body.name,
          category: req.body.category,
          price: req.body.price
        });
        //如果不存在则新增用户
        new_cloth.save(function(e, cloth) {
          if (e) {
            cb("请重试");
          }
          cb(null); //成功后返回
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
        }; //注册失败返回主册页
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });
});

router.post('/addPic', multipart(), function(req,res){
  async.waterfall([
      function(cb) {
        upload.upload(req, function(e,name) {
          if (e) {
            cb(e,null)
          } else {
            cb(null,name)
          }
        });
      },
      function(name,cb) {
        console.log("new file :"+name);
        var info ={
          type: req.body.type,
          id:req.body.id,
          img: name
        };
        console.log(info);
        //如果不存在则新增用户
      cloth.addPic(info,function(e, category) {
          if (e) {
            cb("请重试"+e);
          }else{
            cb(null); //成功后返回
          }
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
        }; //注册失败返回主册页
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });
});

router.post('/addSize', multipart(), function(req,res){
  async.waterfall([
      function(cb) {
        upload.upload(req, function(e,name) {
          if (e) {
            cb(e,null)
          } else {
            cb(null,name)
          }
        });
      },
      function(name,cb) {
        console.log("new file :"+name);
        var info ={
          size: req.body.size,
          id:req.body.id,
          img: name
        };
        console.log(info);
        //如果不存在则新增用户
      cloth.addSize(info,function(e, category) {
          if (e) {
            cb("请重试"+e);
          }else{
            cb(null); //成功后返回
          }
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
        }; //注册失败返回主册页
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });
});

module.exports = router;
