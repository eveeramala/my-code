import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EntityDataService } from '../../services/entitydata.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchUIStateService } from '../../services/search-uistate.service';
import { NgProgress } from '@ngx-progressbar/core';

var chars = '0123456789ABCDEF'.split('');

var randomColor = function () {
  var colors = ["#8BC7C2", "#F4EE6C", "#FFA4A4", "#86A7FF", "#71C7FC", "#F9C588", "#C8EB68", "#95FBFF", "#72CB7D", "#F79BE4"];
  var color = '';
  color = colors[Math.floor(Math.random() * colors.length)];
  console.log('color:' + color);
  return color;
};

@Component({
  selector: 'app-homepage-graph',
  templateUrl: './homepage-graph.component.html',
  styleUrls: ['./homepage-graph.component.css']
})
export class HomepageGraphComponent implements OnInit {
  @Output() selectAction: EventEmitter<any[]> = new EventEmitter<any[]>();
  data = [];
  svg;
  svg_width = 900;
  svg_height = 360;
  circles = [];
  assetBusinessCategories: any[];
  constructor(private searchState: SearchUIStateService, private _router: Router,
    private _activatedRoute: ActivatedRoute, private service: EntityDataService, public progress: NgProgress, ) { }

  ngOnInit() {
    this.buildSVG(parent)
    this.bindLogicalNavigation(null, 'asset')
  }
  bindLogicalNavigation(entity: object[], input: string) {
    this.service.getAssestBusinessCategories().subscribe(data => {
      let businessCategoryData = [];
      businessCategoryData = data.value;
      let parent = [];
      // tslint:disable-next-line:forin
      for (const j in businessCategoryData) {
        if (businessCategoryData[j].ParentBusinessCategoryId === null
          || businessCategoryData[j].ParentBusinessCategoryId === 0) {
          parent.push(
            {
              'id': businessCategoryData[j].BusinessCategoryId,
              'parent': businessCategoryData[j].Name,
              'Name': businessCategoryData[j].Name,
              'selected': false,
              'collapseChild': false,
              'items': [],
              'Count': businessCategoryData[j].CountAsset
            }
          );
        }
      }
      if (parent.length > 0) {
        for (const k in parent) {
          let child = [];
          for (const j in businessCategoryData) {
            if (parent[k].id === businessCategoryData[j].ParentBusinessCategoryId) {
              child.push({
                'id': businessCategoryData[j].BusinessCategoryId,
                'Name': businessCategoryData[j].Name,
                'child': businessCategoryData[j].Name,
                'selected': false,
                'collapseChild': false,
                ParentBusinessCategoryId: businessCategoryData[j].ParentBusinessCategoryId,
                items: [],
                'Count': businessCategoryData[j].CountAsset
              });
            }
            if (parent[k].items.length === 0) {
              parent[k].items = child;
            }
          }
        }
      }
      if (parent.length > 0) {
        for (const k in parent) {
          if (parent[k].items.length > 0) {
            for (const l in parent[k].items) {
              let grandChild = [];
              for (const j in businessCategoryData) {
                if (parent[k].items[l].id === businessCategoryData[j].ParentBusinessCategoryId) {
                  grandChild.push({
                    'id': businessCategoryData[j].BusinessCategoryId,
                    'Name': businessCategoryData[j].Name,
                    'child': businessCategoryData[j].Name,
                    'selected': false,
                    ParentBusinessCategoryId: businessCategoryData[j].ParentBusinessCategoryId,
                    items: [],
                    'Count': businessCategoryData[j].CountAsset
                  });
                }
              }
              if (parent[k].items[l].items.length === 0) {
                parent[k].items[l].items = grandChild;
              }
            }
          }
        }
      }
      this.assetBusinessCategories = parent;
      this.buildSVG(parent);
    });
  }
  buildSVG(parent): void {
    this.data = [];
    let rangeBegin = 100;
    this.data = parent;
    let incrementor = Math.round(this.svg_width / this.data.length);
    let rangeEnd = incrementor;
    for (let i = 0; i < this.data.length; i++) {
      let x_axis = Math.random() * (rangeEnd - rangeBegin) + rangeBegin;
      rangeBegin = rangeEnd;
      rangeEnd = rangeEnd + incrementor;
      let y_axis = Math.random() * 200 + 100;
      this.circles.push({
        x: x_axis,
        y: y_axis,
        radius: (this.data[i].Count / 90) + 15,
        color: randomColor(),
        id: this.data[i].id,
        items: this.data[i].items,
        Count: this.data[i].Count,
        Name: this.data[i].Name
      });
    }
  }

  navigateToDetails(data) {
    this.searchState.searchUIState.fromWhere = 'HomeGraph';
    this.assetBusinessCategories.forEach(item => {
      if (item.id === data.id){
        item.selected = true;       
      } else {
        item.selected = false;
      }
      let obj = item.items;
      for (let i = 0; i < obj.length; i++) {
        if (obj[i].ParentBusinessCategoryId === item.id) {
            obj[i].selected = item.selected;
            for (let j = 0; j < obj[i].items.length; j++) {
                obj[i].items[j].selected = item.selected;
            }
        }
    }      
    })
    this.searchState.searchUIState.SearchFilters.BusinessCategories = this.assetBusinessCategories;
    this.selectAction.emit(this.assetBusinessCategories);
    this._router.navigate(['/browse',], { relativeTo: this._activatedRoute });
  }
}
