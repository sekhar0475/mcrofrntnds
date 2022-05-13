import { SubModule } from './subModule.model';
export interface Module {
    moduleId: number;
    moduleName: string;
    ModuleImage: string;
    subModuleMasterList: SubModule[];
}
