import { defineLazyDefaults } from './base';
import { ResourceCodeError } from './code-error';
import { ResourceCodeLoading } from './code-loading';

defineLazyDefaults({ Loading: ResourceCodeLoading, Error: ResourceCodeError });
