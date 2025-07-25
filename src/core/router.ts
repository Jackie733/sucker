/**
 * Router System
 * Supports parameter routing, wildcards, middleware and other modern routing features
 */

export interface RouteParams {
  [key: string]: string;
}

export type RouteHandler = Function;
export type Middleware = Function;

export interface RouteMatch {
  handler: RouteHandler;
  params: RouteParams;
  middleware?: Middleware[];
}

interface RouteNode {
  segment: string;
  isParam: boolean;
  paramName: string | undefined;
  isWildcard: boolean;
  children: Map<string, RouteNode>;
  handlers: Map<string, RouteHandler>;
  middleware: Middleware[];
}

/**
 * High-performance router
 * Uses Trie tree for fast route matching
 */
export class Router {
  private root: RouteNode;

  constructor() {
    this.root = this.createNode('');
  }

  /**
   * Add route
   */
  addRoute(
    method: string,
    path: string,
    handler: Function,
    middleware: Function[] = []
  ): void {
    const segments = this.parsePath(path);
    let currentNode = this.root;

    // Build routing tree
    for (const segment of segments) {
      const key = this.getNodeKey(segment);

      if (!currentNode.children.has(key)) {
        currentNode.children.set(key, this.createNode(segment));
      }

      currentNode = currentNode.children.get(key)!;
    }

    // Set handler and middleware
    currentNode.handlers.set(method.toUpperCase(), handler);
    currentNode.middleware.push(...middleware);
  }

  /**
   * Match route
   */
  match(method: string, path: string): RouteMatch | null {
    const segments = this.parsePath(path);
    const params: RouteParams = {};

    const node = this.matchNode(this.root, segments, 0, params);

    if (!node) {
      return null;
    }

    const handler = node.handlers.get(method.toUpperCase());
    if (!handler) {
      return null;
    }

    return {
      handler,
      params,
      middleware: node.middleware
    };
  }

  /**
   * Recursively match route nodes
   */
  private matchNode(
    node: RouteNode,
    segments: string[],
    index: number,
    params: RouteParams
  ): RouteNode | null {
    // Matching complete
    if (index === segments.length) {
      return node.handlers.size > 0 ? node : null;
    }

    const segment = segments[index];
    if (!segment) return null;

    // 1. Try exact match
    if (node.children.has(segment)) {
      const result = this.matchNode(
        node.children.get(segment)!,
        segments,
        index + 1,
        params
      );
      if (result) return result;
    }

    // 2. Try parameter matching
    for (const [key, child] of node.children) {
      if (child.isParam && child.paramName) {
        const paramsCopy = { ...params };
        paramsCopy[child.paramName] = segment;

        const result = this.matchNode(child, segments, index + 1, paramsCopy);
        if (result) {
          Object.assign(params, paramsCopy);
          return result;
        }
      }
    }

    // 3. Try wildcard matching
    for (const [key, child] of node.children) {
      if (child.isWildcard) {
        const remaining = segments.slice(index).join('/');
        params['*'] = remaining;
        return child.handlers.size > 0 ? child : null;
      }
    }

    return null;
  }

  /**
   * Parse path into segments
   */
  private parsePath(path: string): string[] {
    return path
      .split('/')
      .filter(segment => segment.length > 0)
      .map(segment => decodeURIComponent(segment));
  }

  /**
   * Create route node
   */
  private createNode(segment: string): RouteNode {
    const isParam = segment.startsWith(':');
    const isWildcard = segment === '*';

    return {
      segment,
      isParam,
      paramName: isParam ? segment.slice(1) : undefined,
      isWildcard,
      children: new Map(),
      handlers: new Map(),
      middleware: []
    };
  }

  /**
   * Get node key
   */
  private getNodeKey(segment: string): string {
    if (segment.startsWith(':')) {
      return ':param';
    }
    if (segment === '*') {
      return '*';
    }
    return segment;
  }

  /**
   * Get all route information (for debugging)
   */
  getRoutes(): Array<{ method: string; path: string; middleware: number }> {
    const routes: Array<{ method: string; path: string; middleware: number }> =
      [];

    const traverse = (node: RouteNode, path: string) => {
      const currentPath = path + (node.segment ? `/${node.segment}` : '');

      for (const [method] of node.handlers) {
        routes.push({
          method,
          path: currentPath || '/',
          middleware: node.middleware.length
        });
      }

      for (const child of node.children.values()) {
        traverse(child, currentPath);
      }
    };

    traverse(this.root, '');
    return routes;
  }
}
