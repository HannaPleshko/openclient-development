/**
 * Represents the structure to query the domino server for documents. 
 */
export class PimSearchQuery {
    /** Specifies the maximum allowable number of documents scanned across all query terms. DQL execution returns an error when exceeded. Default is 500,000. */
    maxScanDocs: number;
    /** Specifies the maximum allowable number of view entries scanned across all query terms. DQL execution returns an error when exceeded. Default is 200,000. */
    maxScanEntries: number;
    /** Specifies not to perform any view processing in satisfying a query. Default is False (off). */
    noViews: boolean; 
    /** Query in DQL or FTSEARCH format..unfortunately capabilities depend on domino version */
    query: string;
    /** Type of query string. Can be either DQL or FTSEARCH. Default is DQL. */          
    type = "DQL";  
    /** Specifies the maximum allowable seconds a DQL query is allowed to run. DQL execution returns an error when exceeded. Default is 300 (5 minutes). */
    timeoutSecs: number; 
    /**  
     * Structure with key is the variable name and the value is the variable value.
     * Positional substitution variables supply question marks in the query. In the following example, values 
     * are supplied via 1-based assignment, where the order_no value is variable 1 and order_origin is variable 2.
     * String query = "order_no = ?  and order_origin = ?";
     * Named substitution variables supply question marks followed by alphanumeric and special character text 
     * names of 1-15 bytes that comprise the name. Values are supplied using the text following the question 
     * mark only. Here is the same query with named substitution variables:
     *    String query = "order_no = ?order_num  and order_origin = ?order_origin";
     * 
     * For example
     * {
     *     order_num:	    <string value>,
     *     order_origin:	<string value>
     * }
     */  
    variables: any; 
    /** Specifies to DQL processing to refresh every view it opens to perform any view processing to satisfy a query. Default is False. */
    viewRefresh: boolean;
}