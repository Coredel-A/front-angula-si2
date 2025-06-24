import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriasFormsComponent } from './historias-forms.component';

describe('HistoriasFormsComponent', () => {
  let component: HistoriasFormsComponent;
  let fixture: ComponentFixture<HistoriasFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriasFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriasFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
