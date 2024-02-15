import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Input, InputNumber, Popconfirm, Table, Typography,Tag } from 'antd';

interface Item {
  id: number;
  first_name: string;
  last_name: number;
  email: string;
}
interface Subject {
  subject_id: number;
  sub_name: string;
  // Add other properties as needed
}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const App: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [sub, setSub] = useState<Subject[]>([]);
  const [editingKey, setEditingKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subjects: [] as Array< string| never>
  });
  const fetchData = async () => {
    try {
      let apiUrl='http://localhost:4001/student'
      if(searchTerm){
        apiUrl+=`?search=${searchTerm}`
      }
        const res = await axios.get(`${apiUrl}`);
        const res2 = await axios.get<Subject[]>('http://localhost:4001/subjects');
        const subjectMap: { [key: number]: string } = {};
       res2.data.forEach(subject => {
          subjectMap[subject.subject_id] = subject.sub_name;
      });

      const transformedData = res.data.map((student: { id: number, first_name: string, last_name: string, email: string, subjects: number[] }) => {
        return {
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            subjects: student.subjects.map((id: number) => subjectMap[id])
        };
    });
        const data2=res2.data;
        setSub(data2)
        setData(transformedData)
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
useEffect(()=>{
  fetchData();

},[searchTerm])

  useEffect(()=>{
  fetchData();
 },[])

const isEditing = (record: Item) => record.id === editingKey;

const edit = (record: Partial<Item> & { id: React.Key }) => {

    form.setFieldsValue({ first_name: '', last_name: '', email: '', ...record });
    setEditingKey(record?.id);
  };

  const cancel = () => {
    setEditingKey(0);
  };
  const handleSearchChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
   
  };

  const save = async (email:string) => {
    try {
      const row = (await form.validateFields()) as Item;
      const newData = [...data];
      const res = await axios.patch(`http://localhost:4001/${email}`,row);
      if(res.status===200){
        await fetchData()
          alert('student update successfully')
          setEditingKey(0);

      } else {
        
        setData(newData);
        setEditingKey(0);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'subjects') {
      // Handle multiple subjects with checkboxes
      const updatedSubjects = (e.target as HTMLInputElement).checked
        ? [...formData.subjects, value]
        : formData.subjects.filter((subject) => subject !== value);

      setFormData((prevData) => ({ ...prevData, subjects: updatedSubjects }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };
  

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log({formData})

    const res = await axios.post(`http://localhost:4001/student`,formData);
    if(res.status===201){
     await fetchData()      
      alert('student created successfully')

    }else{

    }

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subjects: [],
    });
  };

  const columns = [
    {
      title: 'firstname',
      dataIndex: 'first_name',
      width: '25%',
      editable: true,
    },
    {
      title: 'lastname',
      dataIndex: 'last_name',
      width: '15%',
      editable: true,
    },
    {
      title: 'email',
      dataIndex: 'email',
      width: '40%',
      editable: false,
    },
    {
      title: 'subjects',
      dataIndex: 'subjects',
      width: '25%',
      render: (subjects: string[]) => (
        <span>
          {subjects.map((sub: string) => (
            <Tag color="blue" key={sub}>
              {sub}
            </Tag>
          ))}
        </span>
      ),
      editable: false,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record?.email)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== 0} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      }, 
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
    <h1 className="text-4xl font-bold mb-4 mx-10">Student Management</h1>

   <form onSubmit={handleSubmit}  className="mb-4 mx-8">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block mb-2">First Name</label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        className="border p-2 w-full"
        required
      />
    </div>
    <div>
      <label className="block mb-2">Last Name</label>
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        className="border p-2 w-full"
        required
      />
    </div>
  </div>

  <div className="mb-4">
    <label className="block mb-2">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className="border p-2 w-full"
      required
    />
  </div>
  <div className="mb-4">
    <label className="block mb-2">Subjects</label>
    {/* Create individual checkboxes for each subject */}
    {sub?.map((subject) => (
      <div key={subject?.subject_id} className="mb-2">
        <input
          type="checkbox"
          name="subjects"
          value={subject?.subject_id}
          checked={formData.subjects.includes(String(subject?.subject_id))}
          onChange={handleInputChange}
          className="mr-2"
        />
        <label>{subject?.sub_name}</label>
      </div>
    ))}
  </div>


  <button type="submit" className="bg-blue-500 text-white px-4 py-2 mb-2">
    Save
  </button>
  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full focus:outline-none"
          onChange={handleSearchChange}
        />
        <span className="text-gray-500">
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M20 20l-5.5-5.5M12 17l-4-4m4 4-4-4m4 4L4 4" />
          </svg>
        </span>
      </div>
</form>
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
    </>
   
  );
};

export default App;