import { Component } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  imports: [MatDivider, MatToolbar],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {}
