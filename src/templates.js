import { BUTTON_ID, FRAME_ID } from './constants';
import './assets/styles.css';

export const button = `
    <button id="${BUTTON_ID}">CHECK LIVENESS</button>
`;

export const embeddedFrame = `
  <div class="overlay">
    <div class="popup-overlay">
      <iframe id="${FRAME_ID}" class="embeddedIframe" frameborder="0" src="%src%">
    </div>
  </div>
`;
