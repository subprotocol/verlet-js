#include<bits/stdc++.h>
using namespace std;
int sum(int,int);
int main()
{
	int x,y;
	cin>>x>>y;
   int s=sum(x,y);  //call by value,actual argument
   cout<<s;
	
}
int sum(int a,int b)   //formal argument
{
	int c;
	c=a+b;
	return c;
}
