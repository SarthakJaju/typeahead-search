import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-typeahead-process-overlay-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typeahead-process-overlay-spinner.component.html',
  styleUrls: ['./typeahead-process-overlay-spinner.component.scss']
})
export class TypeaheadProcessOverlaySpinnerComponent {
  @Input( {required: true} ) showProcessOverlay: boolean;
  @Input() errorText: string;
  @Input() styles: object;
}
