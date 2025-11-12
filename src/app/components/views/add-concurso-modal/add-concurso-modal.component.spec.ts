import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConcursoModalComponent } from './add-concurso-modal.component';

describe('AddConcursoModalComponent', () => {
  let component: AddConcursoModalComponent;
  let fixture: ComponentFixture<AddConcursoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddConcursoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddConcursoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
