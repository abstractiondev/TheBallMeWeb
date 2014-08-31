/**
 * Created by kalle on 31.5.2014.
 */


interface IViewController {
    VisibleTemplateRender():void;
    InvisibleTemplateRender():void;
    Initialize(dataUrl:string):void;
    ExecuteCommand(commandName:string);
    ExecuteOperation(operationDomain:string, operationName:string, parameters:any):any;
}

export = IViewController;
