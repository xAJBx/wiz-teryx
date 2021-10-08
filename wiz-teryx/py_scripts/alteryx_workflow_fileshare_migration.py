import os
import zipfile
import time
import pandas as pd
import sys

# Script manipulates/creates fileshares from the current temp workflow being migrated

# parse argument to get dev and prod hostname
server_list = sys.argv[1].split(';')
dev_hostname = server_list[0]
prod_hostname = server_list[1]
filename = "file"

print('Changing share dirrectories')

#get wiz-teryx root dirrectory
script_dir = os.getcwd()
path_list = script_dir.split('\\')
project_root = '\\'.join(path_list[0:-1]) + "\\wiz-teryx"
#print(project_root)

#create constant refrences relying on wiz-teryx file structure
workflow_yxzp = project_root + '\\migration_stage\\'+ filename +'.yxzp'
workflow_zip = project_root + '\\migration_stage\\'+ filename +'.zip'
workflow_dir = project_root + '\\migration_stage\\'
alteryxDB_Data_Connection_Relationship = project_root + '\\alteryxDB\\Data_Connection_Relationship.csv'

#rename alteryx specific archive to .zip
os.rename(workflow_yxzp, workflow_zip)



#extract archive
wf_name = ''
with zipfile.ZipFile(workflow_zip, 'r') as zip_ref:
    #catch contained wf name
    wf_name = zip_ref.infolist()[0].filename
    #extract archive
    zip_ref.extractall(workflow_dir)


#create workflow to be processed path    
workflow_yxwz = workflow_dir + '\\' +  wf_name
#print(workflow_yxwz)


#read in Data Connection Relationship tables
data_conn_rel_df = pd.read_csv(alteryxDB_Data_Connection_Relationship)
#print(data_conn_rel_df)



##read in workflow_yzwz
# process share files pointer in xml 
new_file_mem = ''
with open(workflow_yxwz, "r") as fp:
    line = fp.readline()
    cnt = 1
    while line:
        if dev_hostname in line:
            new_file_mem += line.replace(dev_hostname,prod_hostname)
        else:
            new_file_mem += line 

        
            
        line = fp.readline()
        cnt += 1

        
#write new file from ne_file_mem
fp = open(workflow_yxwz, "w")
fp.write(new_file_mem)
fp.close()
        
print("changing DB ids")
# Replace name and id based off of rlationship tables
workflow_file_obj = open(workflow_yxwz)
workflow_file_mem = str(workflow_file_obj.read())
#print(workflow_file_mem)
for index, rec in data_conn_rel_df.iterrows():
    name_condition = str(data_conn_rel_df.at[index, 'dev_name']) in str(workflow_file_mem)
    print(name_condition)
    if name_condition:
        workflow_file_mem = workflow_file_mem.replace(data_conn_rel_df.at[index, 'dev_name'], data_conn_rel_df.at[index, 'prod_name'])

    
    id_condition = str(data_conn_rel_df.at[index, 'dev_server_id']) in str(workflow_file_mem)        
    print(id_condition)
    if id_condition:
        workflow_file_mem = workflow_file_mem.replace(data_conn_rel_df.at[index, 'dev_server_id'], data_conn_rel_df.at[index, 'prod_server_id'])

        
workflow_file_obj.close()
#print(workflow_file_mem)

#print(workflow_file_mem)
workflow_file = open(workflow_yxwz, "wt")
workflow_file.write(workflow_file_mem)
workflow_file.close()


#with open(workflow_yxwz, "r") as fp:
#    line = fp.readline()
#    cnt = 1
#    while line:
#        print("Line {}: {}".format(cnt, line))
#        line = fp.readline()
#        cnt += 1
    

#real_name = workflow_dir + wf_name[:-5] + ".yxzp"
#print(real_name)

#recreate yxwz
zip_arc = zipfile.ZipFile(workflow_zip, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=True)
zip_arc.write(workflow_yxwz, arcname=wf_name)
zip_arc.comment = str.encode(wf_name) #comment is required for Alteryx target server to see a valid package...must be in bytes
zip_arc.close()
os.rename(workflow_zip,workflow_yxzp)#real_name)

print('cleaning up migration_stage dirrectory')
#cleanup dirrectory
os.remove(workflow_yxwz)
#os.remove(real_name)
#os.remove(workflow_yxzp)

print('data dependicies python script complete')


