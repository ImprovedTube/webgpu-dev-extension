if (typeof GPUDevice !== 'undefined') {
  const errorScopeStack/*: {type: GPUErrorFilter, errors: GPUError[]}[]*/ = [];
  const origPushErrorScope = GPUDevice.prototype.pushErrorScope;
  const origPopErrorScope = GPUDevice.prototype.popErrorScope;

  function addErrorWrapper(api, fnName) {
    const origFn = api.prototype[fnName];
    api.prototype[fnName] = function(...args) {
      const stack = new Error();
      origPushErrorScope.call(this, 'validation');
      const result = origFn.call(this, ...args);
      origPopErrorScope.call(this)
        .then(error => {
          if (error) {
            console.error(fnName, args);
            console.error(error.message);
            console.error(stack.stack);
            if (errorScopeStack.length > 0) {
              errorScopeStack[errorScopeStack.length - 1].errors.push(error);
            } else {
              this.dispatchEvent(new GPUUncapturedErrorEvent('validation', { error }));
            }
          }
         });
      return result;
    }
  }

  function getAPIFunctionNames(api) {
    return Object.entries(Object.getOwnPropertyDescriptors(api.prototype))
       .filter(([, info]) => info.enumerable && typeof info.value === 'function')
       .map(([name]) => name)
  }

  const skip = new Set([
    'pushErrorScope',
    'popErrorScope',
    'destroy',
  ]);
  getAPIFunctionNames(GPUDevice)
    .filter(n => !skip.has(n))
    .forEach(n => addErrorWrapper(GPUDevice, n));

  GPUDevice.prototype.pushErrorScope = (function(origFn) {
    return function(/*this: GPUDevice,*/ type/*: GPUErrorFilter*/) {
      origFn.call(this, type);
      errorScopeStack.push({type, errors: []});
    };
  })(GPUDevice.prototype.pushErrorScope)

  GPUDevice.prototype.popErrorScope = (function(origFn) {
    return async function(/*this: GPUDevice*/) {
      const errorScope = errorScopeStack.pop();
      if (errorScope === undefined) {
        const error = new Error();
        error.name = 'OperationError';
        return Promise.reject(error);
      }
      const err = await origFn.call(this);
      return errorScope.errors.length > 0 ? errorScope.errors[0] : err;
    };
  })(GPUDevice.prototype.popErrorScope)

  GPUAdapter.prototype.requestDevice = (function(origFn) {
    return async function(...args) {
      const device = await origFn.call(this, args);
      if (device) {
        device.addEventListener('uncapturederror', function(e) {
          console.error(e.error.message);
        });
      }
      return device;
    }
  })(GPUAdapter.prototype.requestDevice);
}