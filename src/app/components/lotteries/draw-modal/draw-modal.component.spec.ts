import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawModalComponent } from './draw-modal.component';

describe('DrawModalComponent', () => {
  let component: DrawModalComponent;
  let fixture: ComponentFixture<DrawModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
