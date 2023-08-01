import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@angular/core';
import AgoraRTM, { RtmClient } from 'agora-rtm-sdk';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgoraRTMServiceService {
  private appId = 'fe150a2dd676412585c762ed6453b61b'
  private RTMCLIENT = new BehaviorSubject<RtmClient>(AgoraRTM.createInstance(this.appId))
  RTMClient = this.RTMCLIENT.asObservable()
  gameStarted = false

  constructor() { }

  init() {
    this.RTMCLIENT.value.login({ uid: uuidv4() }).then(() => {
      this.RTMCLIENT.next(this.RTMCLIENT.value)
      console.log('RTM logged in');
    }).catch((r) => {
      console.error('login failed', r);
    })
  }

  destroy() {
    this.RTMCLIENT.value.logout().then(() => {
      console.log('RTM logged out');
      this.RTMCLIENT.next(this.RTMCLIENT.value)
    }).catch((r: any) => {
      console.log('RTM unable to log out');
    })
  }

}
