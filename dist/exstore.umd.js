(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'react'], factory) :
  (factory((global.exstore = {}),global.rxjs,global.react));
}(this, (function (exports,Rx,React) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var store = new Rx.Subject();
  Object.assign(store, {
      state: {},
      actions: {},
      mutations: {},
      getters: {},
      services: {},
      plugins: [],
      middlewares: []
  });
  store.attachModules = attachModules;
  // State
  store.getState = getState;
  store.getStateCapture = getStateCapture;
  store.replaceState = replaceState;
  // Services
  store.getServices = getServices;
  store.attachServices = attachServices;
  // Plugins
  store.attachPlugins = attachPlugins;
  // Middlewares
  store.attachMiddlewares = attachMiddlewares;
  store.applyMiddlewares = applyMiddlewares;
  store.runMiddlewares = runMiddlewares;

  function getStore() {
      return store;
  }

  function getState() {
      return getStore().state;
  }

  function getStateCapture() {
      return JSON.parse(JSON.stringify(getStore().state));
  }

  function replaceState(state) {
      var _store = getStore();

      _store.state = _extends({}, state);
      _store.next({ mutation: 'state:replace', state: _store.getStateCapture() });

      return _store;
  }

  function createStore(_ref) {
      var modules = _ref.modules,
          services = _ref.services,
          plugins = _ref.plugins,
          middlewares = _ref.middlewares;

      var _store = getStore();

      if (modules) {
          _store.attachModules(modules);
      }

      if (services) {
          _store.attachServices(services);
      }

      if (plugins) {
          _store.attachPlugins(plugins);
      }

      if (middlewares) {
          _store.attachMiddlewares(middlewares);
      }

      return _store;
  }

  function applyMiddlewares() {
      var _store = getStore();

      _store.runMiddlewares(_store.middlewares);
  }

  function runMiddlewares(middlewares) {
      if (!middlewares.length) {
          return;
      }

      return function () {
          return middlewares[0](getStore(), middlewares[1] ? runMiddlewares(middlewares.slice(1)) : function () {
              return {};
          });
      };
  }

  function attachModules(modules) {
      var _store = getStore();

      Object.keys(modules).map(function (module) {
          _store.state[module] = modules[module].state;

          if (modules[module].mutations) {
              Object.keys(modules[module].mutations).map(function (mutation) {
                  _store.mutations[mutation] = function (payload) {
                      modules[module].mutations[mutation](_store.state[module], payload);
                      _store.next({ mutation: mutation, state: _store.getStateCapture() });
                  };
              });
          }
          if (modules[module].getters) {
              Object.keys(modules[module].getters).map(function (k) {
                  _store.getters[k] = function (payload) {
                      return modules[module].getters[k](_store.state[module], payload);
                  };
              });
          }
          if (modules[module].actions) {
              Object.keys(modules[module].actions).map(function (k) {
                  _store.actions[k] = function (payload) {
                      return modules[module].actions[k]({
                          store: _store,
                          state: _store.state[module],
                          commit: function commit(mutation, payloads) {
                              return _store.mutations[mutation](payloads);
                          }
                      }, payload);
                  };
              });
          }
      });

      return _store;
  }

  function getServices() {
      return getStore().services;
  }

  function attachServices(services) {
      var _store = getStore();

      Object.assign(_store.services, services);

      return _store;
  }

  function attachPlugins(plugins) {
      var _store = getStore();

      if (plugins.length) {
          plugins.map(function (plugin) {
              _store.plugins.push(plugin);
              plugin(_store);
          });
      }

      return _store;
  }

  function attachMiddlewares(middlewares) {
      var _store = getStore();

      if (middlewares.length) {
          _store.middlewares = [].concat(toConsumableArray(middlewares), toConsumableArray(_store.middlewares));
      }

      return _store;
  }

  function connectReact() {
      var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
          return {};
      };
      var services = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
          return {};
      };

      var _store = getStore();

      return function (WrappedComponent) {
          return function (_React$Component) {
              inherits(_class, _React$Component);

              function _class(props) {
                  classCallCheck(this, _class);

                  var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

                  _this.state = { state: state(_store), services: services(_store) };
                  var snapshot = JSON.stringify(_this.state.state);
                  _this.exstore = _store.subscribe(function (msg) {
                      var newstate = state(_store);
                      var newsnapshot = JSON.stringify(newstate);
                      if (snapshot !== newsnapshot) {
                          snapshot = newsnapshot;
                          _this.updater.enqueueSetState(_this, { state: newstate });
                      }
                  });
                  return _this;
              }

              createClass(_class, [{
                  key: 'componentWillUnmount',
                  value: function componentWillUnmount() {
                      if (this.exstore) {
                          this.exstore.unsubscribe();
                      }
                  }
              }, {
                  key: 'render',
                  value: function render() {
                      return React.createElement(WrappedComponent, _extends({}, this.props, this.state.state, this.state.services));
                  }
              }]);
              return _class;
          }(React.Component);
      };
  }

  var store$1 = getStore();

  var vueActions = function vueActions(keys) {
      return keys.reduce(function (a, c) {
          return _extends({}, a, defineProperty({}, c, function (payload) {
              return this.$store.actions[c](payload);
          }));
      }, { storeAction: function storeAction() {
              return true;
          } });
  };

  var vueGetters = function vueGetters(keys) {
      return keys.reduce(function (a, c) {
          return _extends({}, a, defineProperty({}, c, {
              get: function get$$1() {
                  return this.$store.getters[c](store$1);
              },
              set: function set$$1() {
                  return true;
              }
          }));
      }, { storeGetter: { get: function get$$1() {
                  return true;
              }, set: function set$$1() {
                  return true;
              } } });
  };

  var connectVue = {
      install: function install(Vue, options) {
          Vue.mixin({
              beforeCreate: function beforeCreate() {
                  var $options = this.$options;
                  var $data = $options.data || function () {
                      return {};
                  };

                  var watchStore = $options.computed && !!$options.computed.storeGetter || $options.methods && !!$options.methods.storeAction;

                  this.$store = store$1;

                  if (watchStore) {
                      $options.data = function () {
                          return _extends({}, $data.apply(undefined, arguments), { $$store: store$1 });
                      };
                  }
              }
          });
      }
  };

  exports.getStore = getStore;
  exports.getState = getState;
  exports.getStateCapture = getStateCapture;
  exports.replaceState = replaceState;
  exports.createStore = createStore;
  exports.applyMiddlewares = applyMiddlewares;
  exports.runMiddlewares = runMiddlewares;
  exports.attachModules = attachModules;
  exports.getServices = getServices;
  exports.attachServices = attachServices;
  exports.attachPlugins = attachPlugins;
  exports.attachMiddlewares = attachMiddlewares;
  exports.connectReact = connectReact;
  exports.vueActions = vueActions;
  exports.vueGetters = vueGetters;
  exports.connectVue = connectVue;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
