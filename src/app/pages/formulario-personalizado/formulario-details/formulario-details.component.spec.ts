import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioDetailsComponent } from './formulario-details.component';

describe('FormularioDetailsComponent', () => {
  let component: FormularioDetailsComponent;
  let fixture: ComponentFixture<FormularioDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
