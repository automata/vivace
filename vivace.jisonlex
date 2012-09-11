%%
\s+                                                  /* skip ws */
"//".*                                               /* skip comment */
([0-9]+"."([0-9]+)?|"."[0-9]+|[0-9]+"/"[0-9]+|[0-9]+)       return 'NUMBER';
[a-zA-Z][a-zA-Z0-9#]*                                return 'ID';
"'".*"'"  { yytext = yytext.substr(1,yyleng-2); return 'STRING'; }
"=>"                                            return 'CHAIN';
"="                                            return 'ASSIGN';
"["                                            return 'LBRACKET';
"]"                                            return 'RBRACKET';
"{"                                            return 'LBRACE';
"}"                                            return 'RBRACE';
"("                                            return 'LPAR';
")"                                            return 'RPAR';
"."                                             return 'DOT';
","                                             return 'SEP';
