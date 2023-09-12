'use strict';

window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome ||
        browser;
})();

function injectScript(file) {
  const s = document.createElement('script');
  s.setAttribute('src', file);
  (document.head ?? document.documentElement).appendChild(s);
}

let settings = {};
try {
  settings = JSON.parse(sessionStorage.getItem('settings'));
} catch (e) {
}

if (!settings) {
  settings = {};
}

console.log('settings:', settings);

function sendMessage(cmd, data) {
  window.browser.runtime.sendMessage({cmd, data});
}

const commands = {
  setSessionStorage(obj) {
    Object.entries(obj).forEach(([key, value]) => sessionStorage.setItem(key, JSON.stringify(value)));
  },
  getSessionStorage(keys) {
    return Object.fromEntries(keys.map(key => [key, JSON.parse(sessionStorage.getItem(key))]));
  },
};

window.browser.runtime.onMessage.addListener((m, sender, sendResponse) => {
  console.log('onMessage', m);
  const fn = commands[m.cmd];
  if (!fn) {
    throw new Error(`unknown cmd: '${m.cmd}'`);
  } else {
    return sendResponse(fn(m.data));
  }
});

if (settings.capture) {
  injectScript(chrome.runtime.getURL('scripts/webgpu_recorder.js'));
  injectScript(chrome.runtime.getURL('scripts/gpu-injected.js'));
}

if (settings.compat) {
  injectScript(chrome.runtime.getURL('scripts/webgpu-compat-validation.js'));
}


