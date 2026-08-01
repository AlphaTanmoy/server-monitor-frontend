import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle api key visibility from hidden to visible', () => {
    component.openApiKeyModal();
    fixture.detectChanges();

    expect(component.isApiKeyVisible()).toBeFalse();

    const input = fixture.nativeElement.querySelector('.api-key-modal__input') as HTMLInputElement;
    expect(input.type).toBe('password');

    component.toggleApiKeyVisibility();
    fixture.detectChanges();

    expect(component.isApiKeyVisible()).toBeTrue();
    expect((fixture.nativeElement.querySelector('.api-key-modal__input') as HTMLInputElement).type).toBe('text');
  });

  it('should format disk details into readable summary lines', () => {
    const summary = component.getDetailsSummary({
      name: 'disk',
      healthy: true,
      message: '',
      responseTime: 0,
      timestamp: '',
      history: [],
      details: {
        disks: [
          {
            totalGB: 97.87,
            usedGB: 18.67,
            freeGB: 79.21,
            usage: 19.07,
            name: '/',
            type: 'ext4',
            mount: '/'
          }
        ]
      }
    } as any);

    expect(summary[0]).toContain('disks:');
    expect(summary[0]).toContain('1. / | type=ext4 | mount=/ | total=97.87 | used=18.67 | free=79.21 | usage=19.07%');
  });
});
