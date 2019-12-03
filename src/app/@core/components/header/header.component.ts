import { Component, OnInit } from '@angular/core';
import { MapService } from '@core/services/map.service';
import { MatSlideToggleChange, MatSliderChange } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  checked = false;

  constructor(private map: MapService) { }

  ngOnInit() {
  }

  setMap(e: MatSlideToggleChange) {
    this.map.toggleSources(e.checked);
  }

  setPersons(e: MatSliderChange) {
    this.map.setPersons(e.value);
  }

  centerMap() {
    this.map.flyToStart();
  }

  showSearchRadius() {
    this.map.showSearchRadius();
  }
}
