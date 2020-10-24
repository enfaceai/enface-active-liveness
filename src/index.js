import {
  WIDGET_URL,
  BUTTON_HOLDER_ID,
  BUTTON_ID,
  HTTP_URI,
  PROJECT_ID_ATTRIBUTE,
  FRAME_ID,
  FRAME_WIDTH,
  FRAME_HEIGHT,
} from './constants';
import * as templates from './templates';

export const EnfaceLivenessWidget = function ( {
  debug = false,
  url = WIDGET_URL,
  buttonHolderId = BUTTON_HOLDER_ID,
  projectId = '',
} ) {
  this._DEBUG = !!debug;
  this.projectId = projectId;
  this.url = url;
  this.buttonHolderId = buttonHolderId;
  this.url.endsWith('/') && (this.url = this.url.slice(0, -1));
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
  this.isChrome = /chrome/i.test(navigator.userAgent); // chrome://settings/content/camera
  this.onFailed = function () { alert('liveness failed') };
  this.onSuccess = function () { alert('liveness success') };
  this.init();
};

EnfaceLivenessWidget.prototype.init = function () {
  if (!this.setupButton()) return;
  if (!this.setupProjectId()) return;
};

EnfaceLivenessWidget.prototype.setupButton = function () {
  // automatically setup action button by id
  const buttonHolder = document.getElementById(this.buttonHolderId);
  if ( !buttonHolder ) {
    console.error(`[Enface liveness] Element with id="${this.buttonHolderId}" not found on the page. Please add any.`);
    return false;
  }
  if (buttonHolder.innerHTML) {
    this.button = buttonHolder;
  } else {
    buttonHolder.innerHTML = templates.button;
    this.button = document.getElementById(BUTTON_ID);
  }
  this.button.onclick = this.main.bind(this);
  return !!this.button;
};

EnfaceLivenessWidget.prototype.setupProjectId = function () {
  // get project id from script attribute
  if (this.projectId) return true;
  const scripts = document.getElementsByTagName('script');
  for (const scr of scripts) {
    const projectId = scr.getAttribute(PROJECT_ID_ATTRIBUTE);
    if (projectId) {
      this.projectId = projectId;
      break;
    }
  }
  if (!this.projectId) {
    console.error(`[Enface liveness] Please set "${PROJECT_ID_ATTRIBUTE}" attribute to the <script> tag`);
    return false;
  }
  return !!this.projectId;
};

EnfaceLivenessWidget.prototype.log = function ( value ) {
  this._DEBUG && console.log( value );
};

EnfaceLivenessWidget.prototype.logError = function ( value ) {
  this._DEBUG && console.error( value );
};

EnfaceLivenessWidget.prototype.setDebug = function ( debug ) {
  console.log(`[EnfaceLivenessWidget.setDebug] ${!!debug}`);
  this._DEBUG = !!debug;
};

EnfaceLivenessWidget.prototype.setOnFailed = function ( callback ) {
  this.log('[EnfaceLivenessWidget.setOnFailed]');
  if (typeof callback !== 'function') return console.error('type of setOnFailed parameter must be a function');
  this.onFailed = callback;
};

EnfaceLivenessWidget.prototype.setOnSuccess = function ( callback ) {
  this.log('[EnfaceLivenessWidget.setOnSuccess]');
  if (typeof callback !== 'function') return console.error('type of setOnSuccess parameter must be a function');
  this.onSuccess = callback;
};

EnfaceLivenessWidget.prototype.onMessage = function (message) {
  this.log('[EnfaceLivenessWidget.messageHandler]', { 'this': this });
  if (message.origin !== WIDGET_URL) return;
  switch (message.data._) {
    case 'cancel':
      this.log('[EnfaceLivenessWidget.messageHandler] received message "cancel"');
      this.hideFrame();
      this.onFailed();
      break;
    case 'restart':
      this.log('[EnfaceLivenessWidget.messageHandler] received message "restart"');
      this.showFrame();
      // how to re-access on desktop?
      break;
    case 'success':
      this.log('[EnfaceLivenessWidget.messageHandler] received message "success"');
      this.hideFrame();
      this.onSuccess();
      break;
    default:
      alert('unknown message');
      break;
  }
};

EnfaceLivenessWidget.prototype.showFrame = function () {
  this.log('[EnfaceLivenessWidget.showFrame]', { 'this': this });
  this.messageHandler && window.removeEventListener('message', this.messageHandler, false);
  this.hideFrame();
  this.frameDiv = document.createElement('div');
  this.frameDiv.innerHTML = templates.embeddedFrame.replace('%src%', this.url);
  this.frame = this.frameDiv.querySelector(`#${FRAME_ID}`);
  this.frame.style.width = this.isMobile
    ? '100%'
    : `${FRAME_WIDTH}px`;
  this.frame.style.height = this.isMobile
    ? '100%'
    : `${FRAME_HEIGHT}px`;
  document.body.appendChild(this.frameDiv);
  this.messageHandler = this.onMessage.bind(this);
  window.addEventListener('message', this.messageHandler, false);
};

EnfaceLivenessWidget.prototype.hideFrame = function () {
  this.log('[EnfaceLivenessWidget.hideFrame]', { 'this.frameDiv': this.frameDiv });
  if (!this.frameDiv) return;
  this.frameDiv.parentNode.removeChild(this.frameDiv);
  this.frameDiv = null;
};

EnfaceLivenessWidget.prototype.main = function () {
  this.log('[EnfaceLivenessWidget.main]', { 'this.frameDiv': this.frameDiv });
  if (!this.projectId) {
    return console.error('[EnfaceLivenessWidget.main] Project id is not set');
  }
  this.log(`[EnfaceLivenessWidget.main] using project id ${this.projectId}`);
  this.showFrame();
};

window.EnfaceLivenessWidget = new EnfaceLivenessWidget({});
