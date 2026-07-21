import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CelebracaoPalavraComponent } from './celebracao-palavra.component';

describe('CelebracaoPalavraComponent', () => {
  let component: CelebracaoPalavraComponent;
  let fixture: ComponentFixture<CelebracaoPalavraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CelebracaoPalavraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CelebracaoPalavraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
