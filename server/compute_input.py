## compute_input.py

from neo4j.v1 import GraphDatabase, basic_auth
import string 
import time
import random
import math
import sys

#Read data from stdin
def get_data():
    lines = sys.stdin.readline().strip('"').split('/u')

    elements={}
    for line in string.split(lines[0], '\\n'):
      name,count,impact=line.strip().split(',')
      elements.setdefault((name),[])
      elements[(name)].append( ( int(count), float(impact) ) )

    browsers={}
    for line in string.split(lines[1], '\\n'):
      nameVersion,share=line.strip().split(',')
      browsers.setdefault((nameVersion),[])
      browsers[(nameVersion)].append((float(share)))

    elements_to_browser={}
    for line in string.split(lines[2], '\\n'):
      el_name,browser_name=line.strip().split(',')
      elements_to_browser.setdefault((el_name),[])
      elements_to_browser[(el_name)].append((browser_name))

    return elements, browsers, elements_to_browser

def get_pos(sol):
    pos = 0
    i = 0
    for el in sol:
        #print el
        #print "i ist " + str(i)
        #print "2^i ist " + str(math.pow(2, i))
        if el == 1:
            pos += el * math.pow(2, i)
        i += 1

    pos = int(pos)
    return pos

def get_set(sol):
    z = 0
    el_set = ()
    for e in sol:
        if e == 1:
            el_set = el_set + (all_elements[z],)
        z = z +1

    return el_set

def get_removed(sol):
    z = 0
    el_set = ()
    for e in sol:
        if e == 0:
            el_set = el_set + (all_elements[z],)
        z = z +1

    return el_set

def compute_share_and_impact(sol):
    subset = get_set(sol)

    i = 0
    min_cost = 1000000.55
    best_set = {}
     
    delete_graph()
    create_graph(subset, elements, browsers, elements_to_browser)    

    search_str = "MATCH p=(a:Element)-[r:not_supported_by]->(b:Browser) RETURN a,b LIMIT 2500"
    result = session.run(search_str)
    
    code_impact = 0.00
    lost_share = 0.00
    lost_share_dict = {}
    code_impact_dict = {}
    for record in result:
        lost_share_dict[record['b']['name']] = record['b']['share']
        code_impact_dict[record['a']['name']] = record['a']['count'] * record['a']['impact']
                    
    for ls in lost_share_dict:
        lost_share += lost_share_dict[ls]

    for ci in code_impact_dict:
        code_impact += code_impact_dict[ci]
        
    lost_browser_share = lost_share

    return lost_browser_share, code_impact

def compute_total_cost(sol):

    lost_browser_share, code_impact = compute_share_and_impact(sol)
    delta_code_impact = initial_code_impact - code_impact
    delta = initial_lost_browser_share - lost_browser_share

    if delta > 0:
        total_cost = delta_code_impact / delta
    else:
        total_cost = 10000000

    return total_cost

def delete_graph():
    delete_str = "MATCH (n) OPTIONAL MATCH (n)-[r]-() WITH n,r LIMIT 50000 DELETE n,r RETURN count(n) as deletedNodesCount"
    session.run(delete_str)

def create_graph(subset, elements, browsers, elements_to_browser):
    for el in subset:
        session.run("CREATE (a:Element {name:'" + el + "', count: " + str(elements[el][0][0]) + ", impact: " + str(elements[el][0][1]) + "})")

    for b in browsers:
        session.run("CREATE (a:Browser {name:'" + b + "', share: " + str(browsers[b][0]) + "})")

    for link in elements_to_browser:
        el_name = link

        for b_name in elements_to_browser[link]:
            search_str = "MATCH (a:Element { name: '" + el_name + "'} ), (b:Browser { name: '" + b_name + "'} ) CREATE (a)-[:not_supported_by]->(b)"
            result = session.run(search_str) 

def geneticoptimize(domain,costf,popsize=15,mutprob=0.9,elite=0.1,maxiter=20):
    iterations = 0

    # Mutation Operation
    def mutate(vec):
        i=random.randint(0,len(domain)-1)
        if random.random()<0.5 and vec[i]>domain[i][0]:
          mstep = vec[i]-1
          if mstep < 0:
            mstep = 0
          return vec[0:i]+[mstep]+vec[i+1:] 
        elif vec[i]<domain[i][1]:
          pstep = vec[i]+1
          if pstep > (total_number-1):
            pstep = total_number
          return vec[0:i]+[pstep]+vec[i+1:]
        else: 
          return vec

    # Crossover Operation
    def crossover(r1,r2):
        i=random.randint(1,len(domain)-2)
        return r1[0:i]+r2[i:]

    # Build initial population
    pop=[]
    for i in range(popsize):
        vec=[random.randint(domain[i][0],domain[i][1]) 
             for i in range(len(domain))]
        pop.append(vec)

    # How many parents from each generation?
    topelite=int(elite*popsize)

    # Main loop 
    for i in range(maxiter):
        scores=[(costf(v),v) for v in pop]
        scores.sort()
        ranked=[v for (s,v) in scores]

        # Start with the top winners
        pop=ranked[0:topelite]

        # Add mutated forms of winners
        while len(pop)<popsize:
            iterations = iterations + 1
            if random.random()<mutprob:
                # Mutation
                c=random.randint(0,topelite)
                pop.append(mutate(ranked[c]))
            else:
                # Crossover
                c1=random.randint(0,topelite)
                c2=random.randint(0,topelite)
                pop.append(crossover(ranked[c1],ranked[c2]))

        print scores[0][0]
        sys.stdout.flush()

    return scores

def compute_total_cost_all():
    search_str = "MATCH p=(a:Element)-[r:not_supported_by]->(b:Browser) RETURN a,b LIMIT 2500"
    result = session.run(search_str)
    
    code_impact = 0.00
    lost_share = 0.00
    lost_share_dict = {}
    code_impact_dict = {}
    for record in result:
        #lost_share += record['b']['share']
        #print record['a']
        lost_share_dict[record['b']['name']] = record['b']['share']
        code_impact_dict[record['a']['name']] = record['a']['count'] * record['a']['impact']
                    
    for ls in lost_share_dict:
        lost_share += lost_share_dict[ls]

    for ci in code_impact_dict:
        code_impact += code_impact_dict[ci] 

    #code_impact *= 5.0
        
    return lost_share, code_impact

driver = GraphDatabase.driver("bolt://127.0.0.1", auth=basic_auth("neo4j", "sevenval123"))
session = driver.session()


elements, browsers, elements_to_browser = get_data()
all_elements = []
for el in elements:
    all_elements.append(el)

delete_graph()
create_graph(elements, elements, browsers, elements_to_browser)
initial_lost_browser_share, initial_code_impact = compute_total_cost_all()

print "initial graph"
print elements

print "initial_lost_browser_share: " + str(initial_lost_browser_share)
print "initial_code_impact: " + str(initial_code_impact)
print "initial cost: " + str(initial_code_impact / initial_lost_browser_share)

num_of_els = len(all_elements)

total_number = math.pow(2, len(all_elements))

domain=[(0,1)]*(num_of_els)

scores = geneticoptimize(domain,compute_total_cost)
print scores[0][1]
sys.stdout.flush()
row = 10
a = []

for i in range(row):
    gained_share, code_impact = compute_share_and_impact(scores[i][1])
    a[len(a):] = [[initial_lost_browser_share - gained_share, str(get_removed(scores[i][1]))]]

print a

session.close()
