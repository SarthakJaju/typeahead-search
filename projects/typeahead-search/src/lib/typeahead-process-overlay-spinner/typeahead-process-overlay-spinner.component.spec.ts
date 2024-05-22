
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadProcessOverlaySpinnerComponent } from './typeahead-process-overlay-spinner.component';

describe('TypeaheadProcessOverlaySpinnerComponent', () => {
  let component: TypeaheadProcessOverlaySpinnerComponent;
  let fixture: ComponentFixture<TypeaheadProcessOverlaySpinnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TypeaheadProcessOverlaySpinnerComponent]
    });
    fixture = TestBed.createComponent(TypeaheadProcessOverlaySpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
