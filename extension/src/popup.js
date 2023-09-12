/* eslint-env webextensions, browser */
import {
  settings,
} from './settings.js';
import {
  loadSettings,
  saveSettings,
} from './utils.js';
import {GUI} from './gui.js';


window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome ||
        browser;
})();


async function main() {
  await loadSettings();

  const controlsElem = document.querySelector('#controls');
  const gui = new GUI().onChange(saveSettings);
  controlsElem.appendChild(gui.elem);

  gui.add(settings, 'capture').name('Capture');
  gui.add(settings, 'compat').name('Emulate Compat');
}

main();