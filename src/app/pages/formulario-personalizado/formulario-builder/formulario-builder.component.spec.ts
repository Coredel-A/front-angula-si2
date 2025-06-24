import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioBuilderComponent } from './formulario-builder.component';

describe('FormularioBuilderComponent', () => {
  let component: FormularioBuilderComponent;
  let fixture: ComponentFixture<FormularioBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
