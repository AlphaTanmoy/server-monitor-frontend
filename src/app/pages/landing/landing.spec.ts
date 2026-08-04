import { ComponentFixture, TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { MonitorService } from '../../core/services/monitor';
import { Landing } from './landing';

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let component: Landing;
  let monitorServiceSpy: jasmine.SpyObj<MonitorService>;

  beforeEach(async () => {
    monitorServiceSpy = jasmine.createSpyObj('MonitorService', ['getHealth']);

    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        {
          provide: MonitorService,
          useValue: monitorServiceSpy,
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
  });

  it('should show the backend-down state when the health check fails', async () => {
    monitorServiceSpy.getHealth.and.returnValue(throwError(() => new Error('backend down')));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isBackendOffline()).toBeTrue();

    const overlay = fixture.nativeElement.querySelector('.landing-screen__offline-panel') as HTMLElement | null;
    expect(overlay).toBeTruthy();
    expect(overlay?.textContent).toContain('Backend is down');
  });
});
