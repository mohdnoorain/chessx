import { TestBed } from '@angular/core/testing';

import { AgoraRTMServiceService } from './agora-rtmservice.service';

describe('AgoraRTMServiceService', () => {
  let service: AgoraRTMServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgoraRTMServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
