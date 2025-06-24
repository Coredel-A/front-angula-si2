import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalesFormsComponent } from './sucursales-forms.component';

describe('SucursalesFormsComponent', () => {
  let component: SucursalesFormsComponent;
  let fixture: ComponentFixture<SucursalesFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SucursalesFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucursalesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
