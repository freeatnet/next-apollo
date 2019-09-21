'use strict'

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard')

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports['default'] = void 0

var _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'))

var _defineProperty2 = _interopRequireDefault(
  require('@babel/runtime/helpers/defineProperty')
)

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime/helpers/asyncToGenerator')
)

var _objectWithoutProperties2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutProperties')
)

var _react = _interopRequireWildcard(require('react'))

var _head = _interopRequireDefault(require('next/head'))

var _reactHooks = require('@apollo/react-hooks')

var _apolloBoost = require('apollo-boost')

var _isomorphicUnfetch = _interopRequireDefault(require('isomorphic-unfetch'))

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object)
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object)
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable
      })
    keys.push.apply(keys, symbols)
  }
  return keys
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {}
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        ;(0, _defineProperty2['default'])(target, key, source[key])
      })
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        )
      })
    }
  }
  return target
}

var apolloClient = null

var createDefaultCache = function createDefaultCache() {
  return new _apolloBoost.InMemoryCache()
}

var _default = function _default(apolloConfig) {
  return function(PageComponent) {
    var _ref =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$ssr = _ref.ssr,
      ssr = _ref$ssr === void 0 ? true : _ref$ssr

    var WithApollo = function WithApollo(_ref2) {
      var apolloClient = _ref2.apolloClient,
        apolloState = _ref2.apolloState,
        pageProps = (0, _objectWithoutProperties2['default'])(_ref2, [
          'apolloClient',
          'apolloState'
        ])
      var client = (0, _react.useMemo)(function() {
        return apolloClient || initApolloClient(apolloConfig, apolloState)
      }, [])
      return _react['default'].createElement(
        _reactHooks.ApolloProvider,
        {
          client: client
        },
        _react['default'].createElement(PageComponent, pageProps)
      )
    } // Set the correct displayName in development

    if (process.env.NODE_ENV !== 'production') {
      var displayName =
        PageComponent.displayName || PageComponent.name || 'Component'

      if (displayName === 'App') {
        console.warn('This withApollo HOC only works with PageComponents.')
      }

      WithApollo.displayName = 'withApollo('.concat(displayName, ')')
    } // Allow Next.js to remove getInitialProps from the browser build

    if (typeof window === 'undefined') {
      if (ssr) {
        WithApollo.getInitialProps =
          /*#__PURE__*/
          (function() {
            var _ref3 = (0, _asyncToGenerator2['default'])(
              /*#__PURE__*/
              _regenerator['default'].mark(function _callee(ctx) {
                var AppTree, pageProps, apolloClient, apolloState
                return _regenerator['default'].wrap(
                  function _callee$(_context) {
                    while (1) {
                      switch ((_context.prev = _context.next)) {
                        case 0:
                          AppTree = ctx.AppTree
                          pageProps = {}

                          if (!PageComponent.getInitialProps) {
                            _context.next = 6
                            break
                          }

                          _context.next = 5
                          return PageComponent.getInitialProps(ctx)

                        case 5:
                          pageProps = _context.sent

                        case 6:
                          // Run all GraphQL queries in the component tree
                          // and extract the resulting data
                          apolloClient = initApolloClient(apolloConfig, null)
                          _context.prev = 7
                          _context.next = 10
                          return require('@apollo/react-ssr').getDataFromTree(
                            _react['default'].createElement(AppTree, {
                              pageProps: _objectSpread({}, pageProps, {
                                apolloClient: apolloClient
                              })
                            })
                          )

                        case 10:
                          _context.next = 15
                          break

                        case 12:
                          _context.prev = 12
                          _context.t0 = _context['catch'](7)
                          // Prevent Apollo Client GraphQL errors from crashing SSR.
                          // Handle them in components via the data.error prop:
                          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
                          console.error(
                            'Error while running `getDataFromTree`',
                            _context.t0
                          )

                        case 15:
                          // getDataFromTree does not call componentWillUnmount
                          // head side effect therefore need to be cleared manually
                          _head['default'].rewind() // Extract query data from the Apollo store

                          apolloState = apolloClient.cache.extract()
                          return _context.abrupt(
                            'return',
                            _objectSpread({}, pageProps, {
                              apolloState: apolloState
                            })
                          )

                        case 18:
                        case 'end':
                          return _context.stop()
                      }
                    }
                  },
                  _callee,
                  null,
                  [[7, 12]]
                )
              })
            )

            return function(_x) {
              return _ref3.apply(this, arguments)
            }
          })()
      }
    }

    return WithApollo
  }
}
/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */

exports['default'] = _default

function initApolloClient(apolloConfig) {
  var initialState =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}

  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(apolloConfig, initialState)
  } // Reuse client on the client-side

  if (!apolloClient) {
    apolloClient = createApolloClient(apolloConfig, initialState)
  }

  return apolloClient
}
/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */

function createApolloClient(apolloConfig) {
  var initialState =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  var createCache = apolloConfig.createCache || createDefaultCache

  var config = _objectSpread(
    {
      connectToDevTools: process.browser,
      ssrMode: !process.browser,
      // Disables forceFetch on the server (so queries are only run once)
      cache: createCache().restore(initialState || {})
    },
    apolloConfig
  )

  delete config.createCache
  return new _apolloBoost.ApolloClient(config)
}
