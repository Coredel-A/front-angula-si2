import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPersonalizadoComponent } from './formulario-personalizado.component';

describe('FormularioPersonalizadoComponent', () => {
  let component: FormularioPersonalizadoComponent;
  let fixture: ComponentFixture<FormularioPersonalizadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPersonalizadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPersonalizadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
