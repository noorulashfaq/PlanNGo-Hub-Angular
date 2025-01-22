import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemopageComponent } from './demopage.component';

describe('DemopageComponent', () => {
  let component: DemopageComponent;
  let fixture: ComponentFixture<DemopageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemopageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemopageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
