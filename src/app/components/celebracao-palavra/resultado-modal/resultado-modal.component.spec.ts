import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoModalComponent } from './resultado-modal.component';

describe('ResultadoModalComponent', () => {
  let component: ResultadoModalComponent;
  let fixture: ComponentFixture<ResultadoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
