import * as addPlugin from '@graphql-codegen/add';
import { Types } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNodePlugin from '@graphql-codegen/typed-document-node';
import * as typescriptOperationPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptPlugin from '@graphql-codegen/typescript';

import * as gqlTagPlugin from '@graphql-codegen/gql-tag-operations';
import { processSources } from './process-sources';

export type GqlTagConfig = {
  /** Whether fragment types should be masked or not. */
  maskFragments?: boolean;
};

export const preset: Types.OutputPreset<GqlTagConfig> = {
  buildGeneratesSection: options => {
    const maskFragments = options?.presetConfig?.maskFragments ?? false;
    const sourcesWithOperations = processSources(options.documents);
    const sources = sourcesWithOperations.map(({ source }) => source);

    const pluginMap = {
      ...options.pluginMap,
      [`add`]: addPlugin,
      [`typescript`]: typescriptPlugin,
      [`typescript-operations`]: typescriptOperationPlugin,
      [`typed-document-node`]: typedDocumentNodePlugin,
      [`gen-dts`]: gqlTagPlugin,
    };

    const plugins: Array<Types.ConfiguredPlugin> = [
      { [`add`]: { content: `/* eslint-disable */` } },
      { [`typescript`]: {} },
      { [`typescript-operations`]: {} },
      { [`typed-document-node`]: {} },
      ...options.plugins,
    ];

    const genDtsPlugins: Array<Types.ConfiguredPlugin> = [
      { [`add`]: { content: `/* eslint-disable */` } },
      { [`gen-dts`]: { sourcesWithOperations } },
    ];

    const config = {
      ...options.config,
      inlineFragmentTypes: maskFragments ? 'mask' : options.config['inlineFragmentTypes'],
    };

    return [
      {
        filename: `${options.baseOutputDir}/graphql.ts`,
        plugins,
        pluginMap,
        schema: options.schema,
        config,
        documents: sources,
      },
      {
        filename: `${options.baseOutputDir}/index.ts`,
        plugins: genDtsPlugins,
        pluginMap,
        schema: options.schema,
        config,
        documents: sources,
      },
    ];
  },
};
