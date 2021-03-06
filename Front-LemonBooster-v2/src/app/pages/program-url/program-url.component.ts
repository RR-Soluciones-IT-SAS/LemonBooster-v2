import { ProgramService } from 'src/app/services/program.service';
import { Component, OnInit } from '@angular/core';
import { ToolsService } from 'src/app/services/tools.service';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import swal from "sweetalert2";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-program-url',
  templateUrl: './program-url.component.html',
  styleUrls: ['./program-url.component.scss']
})
export class ProgramUrlComponent implements OnInit {

  error:any;
  program: any;

  url: any;
  scope:any;

  _openSeeds: boolean = false;
  _openEnum: boolean = true;
  _openDiscovery: boolean = false;
  _openMonitoring: boolean = false;

  socketStatus: boolean = false;
  executing: boolean = false;

  constructor(
    public route : ActivatedRoute,
    public programService: ProgramService,
    public toolService:ToolsService,
    public socket: Socket
  ) { }

  ngOnInit(): void {

    this.checkStatus();

    this.route.params.subscribe(
    (data) => {
        this.programService.GetProgram(data['url'])
        .subscribe((data) => {
          this.program = data.data;
          console.log(data);
        }, (error) => {
          if(!error.error.success){
            this.error = error.error.msg;
          }
          console.log(error);
        });
    });

    this.toolService.GetCompletedScan()
      .subscribe((data:any) => {
        if(data.executing){
          this.executing = true;
          swal.fire({
            html: `<span style='color:grey'>${data.msg}<span>`,
            timer: 25000,
            showConfirmButton: false
          });
        } else {
          this.executing = false;
          swal.fire({
            html: `<span style='color:grey'>${data.msg}<span>`,
            timer: 1000,
            showConfirmButton: false
          });
        }
      }, (error) => {
        swal.fire({
          html: `<span style='color:grey'>${error.error.msg}<span>`,
          timer: 25000,
          showConfirmButton: false
        });
      });

  }

  checkStatus(){
    this.socket.on('connect', () => {
      console.log('Connected to Server.');
      this.socketStatus = true;
      this.executing = false;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Server.');
      this.socketStatus = false;
      this.executing = true;
    });
  }

  open(value){
    switch(value){
      case 1: 
          this._openSeeds = true;
          this._openEnum = false;
          this._openDiscovery = false;
          this._openMonitoring = false;
        break;
      case 2: 
          this._openSeeds = false;
          this._openEnum = true;
          this._openDiscovery = false;
          this._openMonitoring = false;
        break;
      case 3: 
          this._openSeeds = false;
          this._openEnum = false;
          this._openDiscovery = true;
          this._openMonitoring = false;
        break;
      case 4: 
        this._openSeeds = false;
        this._openEnum = false;
        this._openDiscovery = false;
        this._openMonitoring = true;
        break;
    }
  }

  executeCompleteScan(scope){

    this.scope = scope;

    this.route.params.subscribe(
      (data) => {
        this.url = data['url'];
      });

    let payload = {
      Url: this.url,
      Scope: this.scope
    }

    console.log(payload);

    this.toolService.WsExecuteCompleteScan(payload); // Ejecuto herramienta.
  }

}
