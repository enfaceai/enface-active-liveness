import {
  WIDGET_URL,
  BUTTON_HOLDER_ID,
  BUTTON_ID,
  HTTP_URI,
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
  // this.isHttp = this.url.startsWith( 'http' );
  this.url = 'https://aaa.com/';
  // this.url.endsWith( '/' ) && ( this.url = this.url.substring( 0, this.url.length - 1 ) );
  this.url.endsWith('/') && (this.url = this.url.slice(0, -1));
  // this.isHttp && ( this.url += HTTP_URI );
  this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( navigator.userAgent );
  this.onFailed = function () {};
  this.onSuccess = function () {};
  this.init();
};

EnfaceLivenessWidget.prototype.init = function () {
  if ( !this.checkEnvironment() ) return;
  // const userData = this.onUserAuthInfo() || null;
  // const request = {
  //   _: userData
  //     ? constants.COMMAND_ENABLE
  //     : constants.COMMAND_AUTH
  // };
  // userData && ( request.userData = userData );
  // this.button.onclick = function () {
  //   this.cancel();
  //   this.send( request );
  // }.bind( this );
  // userData && this.send( {
  //   _: constants.COMMAND_STATUS,
  //   userData
  // } );
};

EnfaceLivenessWidget.prototype.checkEnvironment = function () {
  // automatically setup action button by id
  const buttonHolder = document.getElementById( this.buttonHolderId );
  if ( !buttonHolder ) {
    console.error( `[Enface liveness] Element with id="${this.buttonHolderId}" not found on the page. Please add any.` );
    return false;
  }
  if ( buttonHolder.innerHTML ) {
    this.button = buttonHolder;
  } else {
    buttonHolder.innerHTML = templates.button;
    this.button = document.getElementById( BUTTON_ID );
  }
  // get project id from script attribute
  const scripts = document.getElementsByTagName('script');
  for (const scr of scripts) {
    const projectId = scr.getAttribute('data-liveness-project');
    if (projectId) {
      this.projectId = projectId;
      break;
    }
  }
  if (!this.projectId) {
    console.error('[Enface liveness] Please set "data-liveness-project" attribute to the <script> tag');
  }else {
    this.log(`[Enface liveness] set project id to ${this.projectId}`);
  }
  return !!this.button;
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

window.EnfaceLivenessWidget = new EnfaceLivenessWidget({});
