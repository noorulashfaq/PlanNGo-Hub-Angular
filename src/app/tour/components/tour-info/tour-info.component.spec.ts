import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourInfoComponent } from './tour-info.component';

describe('TourInfoComponent', () => {
  let component: TourInfoComponent;
  let fixture: ComponentFixture<TourInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TourInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
