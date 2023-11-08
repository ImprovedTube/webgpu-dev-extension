if (typeof GPUDevice !== 'undefined') {
  function addErrorWrapper(api, fnName) {
    const origFn = api.prototype[fnName];
    api.prototype[fnName] = function(...args) {
      const stack = new Error();
      const argsCopy = [...args];
      this.pushErrorScope('validation');
      const result = origFn.call(this, ...args);
      this.popErrorScope()
         .then(err => {
          if (err) {
            console.error(fnName, ...args);
            console.error(err.message);
            console.error(stack.stack);
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