'use strict';
angular.module('app', ['ui.router','ngCookies','validation']);

'use strict';
angular.module('app').value('dict',{}).run(['$http','dict',function($http,dict){
  $http.get('/data/city.json').then(function(resp){
    dict.city=resp;
  }).catch(function(result){
    console.log(result);
  });
  $http.get('/data/salary.json').then(function(resp){
    dict.salary=resp;
  }).catch(function(result){
    console.log(result);
  });
  $http.get('/data/scale.json').then(function(resp){
    dict.scale=resp;
  }).catch(function(result){
    console.log(result);
  });
}])

'use strict';
angular.module('app').config(['$provide',function($provide){
  $provide.decorator('$http',['$delegate','$q',function($delegate,$q){
    var get = $delegate.get;
    $delegate.post = function(url,data,config){
      var def = $q.defer();
      get(url).then(function(resp){
        def.resolve(resp);
      }).catch(function(error){
         def.reject(error);
      });
      return {
        success:function(result){
          def.promise.then(result);
        },
        error:function(result){
          def.promise.then(null,result);
        }
      }
    }
    return $delegate;
  }])
}]);

'use strict';

angular.module('app').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('main', {
    url: '/main',
    templateUrl: 'view/main.html',
    controller: 'mainCtrl'
  }).state('position', {
    url: '/position/:id',
    templateUrl: 'view/position.html',
    controller: 'positionCtrl'
  }).state('company', {
    url: '/company/:id',
    templateUrl: 'view/company.html',
    controller: 'companyCtrl'
  }).state('search', {
    url: '/search',
    templateUrl: 'view/search.html',
    controller: 'searchCtrl'
  }).state('login', {
    url: '/login',
    templateUrl: 'view/login.html',
    controller: 'loginCtrl'
  }).state('regesiter', {
    url: '/regesiter',
    templateUrl: 'view/regesiter.html',
    controller: 'regesiterCtrl'
  }).state('favrite', {
    url: '/favrite',
    templateUrl: 'view/favrite.html',
    controller: 'favriteCtrl'
  }).state('me', {
    url: '/me',
    templateUrl: 'view/me.html',
    controller: 'meCtrl'
  }).state('post', {
    url: '/post',
    templateUrl: 'view/post.html',
    controller: 'postCtrl'
  });
  $urlRouterProvider.otherwise('main');
}])

'use strict';
angular.module('app').config(['$validationProvider',function($validationProvider){
   var expression = {
     phone: /^1[\d]{9}/,
     password: function(value){
       var str = value + ''
       return str.length>5;
     },
     required:function(value){
       return !!value;
     }
   };
   var defaultMsg = {
     phone:{
       success:'',
       error:'必须是11位'
     },
     password:{
       success:'',
       error:'至少为6位'
     },
     required:{
       success:'',
       error:'不能为空'
     }
   };
   $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
}]);

'use strict';
angular.module('app').controller('companyCtrl',['$http','$state','$scope',function($http,$state,$scope){
     $http.get('/data/company.json?id='+$state.params.id).then(function(resp){
       console.log(resp);
       $scope.company=resp.data;
     $scope.detail = function(item){
       
     }
     })
}]);

'use strict';
angular.module('app').controller('favriteCtrl',['$http','$state','$scope',function($http,$state,$scope){
  $http.get('/data/myFavorite.json').then(function(resp){
    $scope.list = resp.data;
  }).catch(function(result){
    console.log(result);
  })
}]);

'use strict';
angular.module('app').controller('loginCtrl',['$http','$state','$scope','cache',function($http,$state,$scope,cache){
     $scope.submit = function(){
       $http.post('/data/login.json').success(function(resp){
         console.log(resp);
         cache.put('id',resp.data.id);
         cache.put('name',resp.data.name);
         cache.put('image',resp.data.image);
         $state.go('me');
       })
     }
}]);

'use strict';
angular.module('app').controller('mainCtrl', ['$http','$scope', function($http,$scope){
   $http.get('/data/positionList.json').then(function(resp){
     $scope.list = resp.data;
   }).catch(function(result){
     console.log(result);
   });
}]);

'use strict';
angular.module('app').controller('meCtrl',['$http','$state','$scope','cache',function($http,$state,$scope,cache){
    if(cache.get('name')){
      $scope.name = cache.get('name');
      $scope.image = cache.get('image');
    }
    $scope.logout = function(){
      cache.remove('id');
      cache.remove('name');
      cache.remove('image');
      $state.go('main');
    }
}]);

'use strict';
angular.module('app').controller('positionCtrl',['$log','$q','$http','$state','$scope','cache',function($log,$q,$http,$state,$scope,cache){
   $scope.isLogin= !!cache.get('name');
   $scope.message = $scope.isLogin?'投个简历':'去登陆';
   function getPosition(){
     var def = $q.defer();
     $http.get('/data/position.json?id='+$state.params.id).then(function(resp){
       $scope.position=resp.data;
       if(resp.posted){
         $scope.message="已投递";
       }
       def.resolve(resp);
     }).catch(function(result){
       def.reject(result);
     });
     return def.promise;
   }
   function getCompany(id){
     $http.get('/data/company.json?id='+id).then(function(resp){
       $scope.company=resp.data;
     })
   }
   getPosition().then(function(obj){
     getCompany(obj.companyId);
   });
   $scope.go = function(){
     if($scope.message!=='已投递'){
       if($scope.isLogin){
         $http.post('/data/handle.json',{
           id:$scope.position.id
         }).success(function(result){
           $log.info(result);
           $scope.message='已投递';
         })
       }else{
         $state.go('login');
       }
     }

   };
}]);

'use strict';
angular.module('app').controller('postCtrl',['$http','$state','$scope',function($http,$state,$scope){
    $scope.tabList = [{
      id:'all',
      name:'全部'
    },{
      id:'pass',
      name:'面试邀请'
    },{
      id:'fail',
      name:'不合适'
    }];
    $http.get('/data/myPost.json').then(function(resp){
      $scope.positionList=resp.data;
    }).catch(function(result){
      console.log(result);
    });
    $scope.filterObj = {};
    $scope.tClick = function(id,name){
      switch (id) {
        case 'all':
          delete $scope.filterObj.state;
          break;
        case 'pass':
          $scope.filterObj.state = '1';
          break;
        case 'fail':
           $scope.filterObj.state = '-1';
           break;
        default:
      }
    }
}]);

'use strict';
angular.module('app').controller('regesiterCtrl',['$interval','$http','$state','$scope',function($interval,$http,$state,$scope){
     $scope.submit = function(){
       $http.post('/data/regist.json',$scope.user).success(function(resp){
         $state.go('login');
       })
     }
     var count = 60;
     $scope.send = function(){
       $http.get('/data/code.json').then(function(resp){
         console.log(resp);
          if(1===resp.data.state){
            count=60;
            $scope.time='60s';
            var interval = $interval(function(){
              if(count<=0){
                $interval.cancel(interval);
                $scope.time='';
              }else{
                count--;
                $scope.time = count+'s';
              }
            }, 1000);
          }
       }).catch(function(result){
         console.log(result);
       });
     }
}]);

'use strict';
angular.module('app').controller('searchCtrl',['$http','$state','$scope','dict',function($http,$state,$scope,dict){
     $scope.name='';
     $scope.search = function(){
       $http.get('/data/positionList.json?name='+$scope.name).then(function(resp){
         $scope.list=resp.data;
       }).catch(function(result){
         console.log(result);
       });
     };
     $scope.search();
     $scope.selOption = {};
     $scope.tabList = [{
        id:'city',
        name:'城市'
     },{
       id:'salary',
       name:'薪资'
     },{
       id:'scale',
       name:'规模'
     }];
     var tabId='';
     $scope.filterObj={};
     $scope.tClick = function(id,name){
       tabId=id;
       $scope.selOption.list = dict[id].data;
       $scope.selOption.visible = true;
     }
     $scope.sClick = function(id,name){
       if(id){
         angular.forEach($scope.tabList,function(item){
           if(item.id===tabId){
             item.name=name;
           }
         });
         $scope.filterObj[tabId+'Id'] = id;
       }else{
         delete $scope.filterObj[tabId+'Id'];
         angular.forEach($scope.tabList,function(item){
           if(item.id===tabId){
             switch (item.id){
               case 'city':
               item.name='城市';
               break;
               case 'salary':
               item.name='薪资';
               break;
               case 'scale':
               item.name='规模';
               break;
               default:
             }
           }
         })
       }
     }
}]);

'use strict';
angular.module('app').directive('appCompany',[function(){
  return {
    restrict:'A',
    replace:true,
    scope:{
      com:'='
    },
    templateUrl:'view/template/company.html'
  };
}]);

'use strict';
angular.module('app').directive('appFoot',[function(){
  return {
    restrict:'A',
    replace: true,
    templateUrl:'view/template/footer.html'
  };
}]);

'use strict'
angular.module('app').directive('appHead',['cache',function(cache){
  return {
    restrict:'A',
    replace: true,
    templateUrl:'view/template/head.html',
    link:function($scope){
      $scope.name = cache.get('name')||'';
    }
  };
}]);

'use strict';
angular.module('app').directive('appHeadBar',[function(){
  return {
    restrict:'A',
    replace: true,
    templateUrl:'view/template/headBar.html',
    scope:{
      text:'@'
    },
    link:function($scope){
      $scope.back = function(){
        window.history.back();
      };
    }
  };
}]);

'use strict';
angular.module('app').directive('appCompanyPosition',[function(){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/positionClass.html',
    scope:{
      com:'='
    },
    link:function($scope){
      $scope.showPosition=function(idx){
        $scope.positionList=$scope.com.positionClass[idx].positionList;
        $scope.isActive=idx;
      },
      $scope.$watch('com',function(newVal){
        if(newVal) $scope.showPosition(0);
      });
    }
  };
}]);

'use strict';
angular.module('app').directive('appPositionInfo',['$http',function($http){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/positionInfo.html',
    scope:{
      isActive:'=',
      isLogin:'=',
      posi:'='
    },
    link:function($scope){
      $scope.$watch('posi',function(newVal){
        if(newVal){
          $scope.posi.select = $scope.posi.select||false;
          $scope.imgPath=$scope.posi.select?"../images/star1.png":"../images/star.png"
        }
      })
      $scope.favorite = function(){
        $http.post('/data/favorite.json',{
          id:$scope.posi.id,
          select:$scope.posi.select
        }).success(function(resp){
          $scope.posi.select = !$scope.posi.select;
          $scope.imgPath = $scope.posi.select?'../images/star-active.png':'../images/star.png'
        })
      }
    }
  };
}]);

'use strict';
angular.module('app').directive('appCont',['$http',function($http){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/positionList.html',
    scope:{
      data:'=',
      filterObj:'=',
      isFavorite:'='
    },
    link:function($scope){
      $scope.select = function(item){
        $http.post('/data/myFavorite.json',{
          id:item.id,
          select:!item.select
        }).success(function(resp){
            item.select = !item.select;
        })
      };
    }
  };
}]);

'use strict';
angular.module('app').directive('appTab',[function(){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/searchTab.html',
    scope:{
      list:'=',
      tabClick:'&'
    },
    link:function($scope){
      $scope.click = function(tab){
        $scope.selectId = tab.id;
        $scope.tabClick(tab);
      };
    }
  };
}]);

'use strict';
angular.module('app').directive('appSelect',[function(){
  return {
    restrict:'A',
    replace:true,
    templateUrl:'view/template/select.html',
    scope:{
      list:'=',
      visible:'=',
      sel:'&'
    }
  };
}]);

'use strict';
angular.module('app').filter('filterByObj',[function(){
   return function(list,obj){
      var result = [];
      angular.forEach(list,function(item){
         var isEqual = true;
         for(var e in obj){
           if(item[e]!==obj[e]){
             isEqual = false;
           }
         }
         if(isEqual){
           result.push(item);
         }
      });
      return result;
   };
}]);

'use strict';
angular.module('app').service('cache',['$cookies',function($cookies){
      this.get = function(key){
        return $cookies.get(key);
      };
      this.put = function(key,val){
        $cookies.put(key,val);
      };
      this.remove = function(key){
        $cookies.remove(key);
      };
}]);
