import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriasDetailsComponent } from './historias-details.component';

describe('HistoriasDetailsComponent', () => {
  let component: HistoriasDetailsComponent;
  let fixture: ComponentFixture<HistoriasDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriasDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriasDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
