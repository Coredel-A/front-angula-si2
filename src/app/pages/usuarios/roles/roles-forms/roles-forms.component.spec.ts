import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesFormsComponent } from './roles-forms.component';

describe('RolesFormsComponent', () => {
  let component: RolesFormsComponent;
  let fixture: ComponentFixture<RolesFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
