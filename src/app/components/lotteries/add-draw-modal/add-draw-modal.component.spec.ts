import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDrawModalComponent } from './add-draw-modal.component';

describe('AddDrawModalComponent', () => {
  let component: AddDrawModalComponent;
  let fixture: ComponentFixture<AddDrawModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDrawModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDrawModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
