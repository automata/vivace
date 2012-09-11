/* description: vivace grammar */

/* lexical grammar */

%%

Code
   : DefinitionList
     { $$ = {code: $1}; 
       return $$; }
   ;

DefinitionList
   : DotExpr ASSIGN List DefinitionList
     { $$ = $4; 
       $4.definitions.push({name: $1[0], attr: $1[1], is: $3}); }
   |
     { $$ = {definitions: []}; }
   ;

DotExpr
   : Id DOT Id
     { $$ = [$1, $3]; }
   ;

List
   : BracketList
     { $$ = {type: 'values', val: $1}; }
   | BraceList
     { $$ = {type: 'durations', val: $1}; }
   | ChainList
     { $$ = {type: 'chains', val: $1}; }
   ;

BracketList
   : LBRACKET ListValue RBRACKET
     { $$ = $2; }
   ;

BraceList
   : LBRACE ListValue RBRACE
     { $$ = $2; }
   ;

ChainList
   : NodeExpr
     { $$ = [$1]; }
   | NodeExpr CHAIN ChainList
     { $$ = $3; $3.push($1); }
   ;

NodeExpr
   : Id
     { $$ = {name: $1, parameters: []}; }
   | Id LPAR RPAR
     { $$ = {name: $1, parameters: []}; }
   | Id LPAR ParamList RPAR
     { $$ = {name: $1, parameters: $3}; }
   ;

ParamList
   : Param
     { $$ = [$1]; }
   | Param SEP ParamList
     { $$ = $3; $3.push($1); }
   ;

Param
   : Number
     { $$ = $1; }
   | String
     { $$ = $1; }
   ;

ListValue
   : Value
     { $$ = [$1]; }
   | Value SEP ListValue
     { $$ = $3; $3.push($1); }
   ;

Value
   : Id
     { $$ = $1; }
   | Number
     { $$ = $1; }
   ;

Number
   : NUMBER
     { $$ = {type: 'number', val: Number(eval(yytext))}; }
   ;

String
   : STRING
     { $$ = {type: 'string', val: yytext}; }
   ;

Id
   : ID
     { $$ = {type: 'id', val: yytext}; }
   ;