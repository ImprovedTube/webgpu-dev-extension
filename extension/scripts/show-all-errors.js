if (typeof GPUDevice !== 'undefined') {
  GPUDevice.prototype.popErrorScope = (function(origFn) {
    return async function(...args) {
      const stack = new Error();
      const err = await origFn.call(this, ...args);
      if (err) {
        console.error(err.message);
        console.error(stack.stack);
      }
      return err;
    };
  })(GPUDevice.prototype.popErrorScope);

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