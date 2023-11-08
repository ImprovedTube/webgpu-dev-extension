if (typeof GPUDevice !== 'undefined') {
  GPUTexture.prototype.createView = (function (origFn) {
    return function (desc) {
      const view = origFn.call(this, desc);
      view.description = { ...desc, texture: this };
      return view;
    };
  })(GPUTexture.prototype.createView);
}